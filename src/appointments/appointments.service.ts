import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model, Types } from 'mongoose';

import { Doctor } from '../doctors/schemas/doctor.schema.js';
import { Patient } from '../patients/schemas/patient.schema.js';

import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';

import {
    Appointment,
    type AppointmentDocument,
} from './schemas/appointment.schema.js';

import type { AppointmentStatus } from './constants/appointment.constants.js';

type AppointmentListFilter = {
    appointmentNumber?: {
        $regex: string;
        $options: string;
    };
    patientId?: Types.ObjectId;
    doctorId?: Types.ObjectId;
    departmentId?: string;
    status?: AppointmentStatus;
    appointmentType?: Appointment['appointmentType'];
    priority?: Appointment['priority'];
    startAt?: {
        $gte?: Date;
        $lte?: Date;
    };
};

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name)
        private readonly appointmentModel: Model<AppointmentDocument>,

        @InjectModel(Patient.name)
        private readonly patientModel: Model<Patient>,

        @InjectModel(Doctor.name)
        private readonly doctorModel: Model<Doctor>,
    ) { }

    private escapeRegex(value: string): string {
        return value.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
        );
    }
    async create(
        createAppointmentDto: CreateAppointmentDto,
    ): Promise<AppointmentDocument> {
        const startAt = new Date(createAppointmentDto.startAt);
        const endAt = new Date(createAppointmentDto.endAt);

        this.validateAppointmentTimes(startAt, endAt);

        const [patientExists, doctorExists] = await Promise.all([
            this.patientModel.exists({
                _id: createAppointmentDto.patientId,
                isDeleted: false,
            }),

            this.doctorModel.exists({
                _id: createAppointmentDto.doctorId,
                isDeleted: false,
            }),
        ]);

        if (!patientExists) {
            throw new NotFoundException('Patient not found');
        }

        if (!doctorExists) {
            throw new NotFoundException('Doctor not found');
        }

        const blockingStatuses: AppointmentStatus[] = [
            'pending',
            'booked',
            'arrived',
            'checked_in',
        ];

        const conflictingAppointment =
            await this.appointmentModel.exists({
                doctorId: createAppointmentDto.doctorId,
                status: {
                    $in: blockingStatuses,
                },
                startAt: {
                    $lt: endAt,
                },
                endAt: {
                    $gt: startAt,
                },
            });

        if (conflictingAppointment) {
            throw new ConflictException(
                'The doctor already has an appointment during this time',
            );
        }

        const source = createAppointmentDto.source ?? 'staff';

        const initialStatus: AppointmentStatus =
            source === 'online' ? 'pending' : 'booked';

        const appointmentNumber =
            this.generateAppointmentNumber();

        const appointment = new this.appointmentModel({
            ...createAppointmentDto,

            appointmentNumber,

            patientId: new Types.ObjectId(
                createAppointmentDto.patientId,
            ),

            doctorId: new Types.ObjectId(
                createAppointmentDto.doctorId,
            ),

            startAt,
            endAt,
            source,
            status: initialStatus,

            statusHistory: [
                {
                    toStatus: initialStatus,
                    changedAt: new Date(),
                    reason: 'Appointment created',
                },
            ],
        });

        try {
            return await appointment.save();
        } catch (error: unknown) {
            const databaseError = error as {
                code?: number;
            };

            if (databaseError.code === 11000) {
                throw new ConflictException(
                    'An appointment with the generated number already exists',
                );
            }

            throw error;
        }
    }

    async checkIn(
        id: string,
    ): Promise<AppointmentDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(
                'Invalid appointment ID',
            );
        }

        const checkedInAt = new Date();

        const appointment =
            await this.appointmentModel
                .findOneAndUpdate(
                    {
                        _id: id,
                        status: 'arrived',
                    },
                    {
                        $set: {
                            status: 'checked_in',
                            checkedInAt,
                        },
                        $push: {
                            statusHistory: {
                                fromStatus: 'arrived',
                                toStatus: 'checked_in',
                                changedAt: checkedInAt,
                                reason: 'Patient checked in',
                            },
                        },
                    },
                    {
                        new: true,
                        runValidators: true,
                    },
                )
                .populate({
                    path: 'patientId',
                    select:
                        'fullName preferredName uhid phone gender dateOfBirth',
                })
                .populate({
                    path: 'doctorId',
                    select:
                        'fullName specialization departmentName opdRoomNumber',
                })
                .exec();

        if (appointment) {
            return appointment;
        }

        const existingAppointment =
            await this.appointmentModel
                .findById(id)
                .select('status')
                .lean()
                .exec();

        if (!existingAppointment) {
            throw new NotFoundException(
                'Appointment not found',
            );
        }

        throw new ConflictException(
            `Only an arrived appointment can be checked in. Current status: ${existingAppointment.status}`,
        );
    }

    async findAll(query: ListAppointmentsQueryDto) {
        const filter: AppointmentListFilter = {};

        if (query.search) {
            filter.appointmentNumber = {
                $regex: this.escapeRegex(query.search.trim()),
                $options: 'i',
            };
        }

        if (query.patientId) {
            filter.patientId = new Types.ObjectId(
                query.patientId,
            );
        }

        if (query.doctorId) {
            filter.doctorId = new Types.ObjectId(
                query.doctorId,
            );
        }

        if (query.departmentId) {
            filter.departmentId = query.departmentId;
        }

        if (query.status) {
            filter.status = query.status;
        }

        if (query.appointmentType) {
            filter.appointmentType = query.appointmentType;
        }

        if (query.priority) {
            filter.priority = query.priority;
        }

        if (query.dateFrom || query.dateTo) {
            filter.startAt = {};

            if (query.dateFrom) {
                filter.startAt.$gte = new Date(query.dateFrom);
            }

            if (query.dateTo) {
                filter.startAt.$lte = new Date(query.dateTo);
            }

            if (
                filter.startAt.$gte &&
                filter.startAt.$lte &&
                filter.startAt.$gte > filter.startAt.$lte
            ) {
                throw new BadRequestException(
                    'dateFrom must be before dateTo',
                );
            }
        }

        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;
        const sortDirection: 1 | -1 =
            query.sortOrder === 'asc' ? 1 : -1;

        const [appointments, total] = await Promise.all([
            this.appointmentModel
                .find(filter)
                .populate({
                    path: 'patientId',
                    select:
                        'fullName preferredName uhid phone gender dateOfBirth',
                })
                .populate({
                    path: 'doctorId',
                    select:
                        'fullName specialization departmentName opdRoomNumber',
                })
                .sort({
                    [query.sortBy]: sortDirection,
                })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),

            this.appointmentModel.countDocuments(filter).exec(),
        ]);

        const now = Date.now();

        const items = appointments.map((appointment) => {
            const waitingStart =
                appointment.waitingStartedAt?.getTime();

            const isActivelyWaiting =
                (
                    appointment.status === 'arrived' ||
                    appointment.status === 'checked_in'
                ) &&
                waitingStart !== undefined &&
                waitingStart <= now &&
                !appointment.consultationStartedAt;

            const currentWaitingMinutes = isActivelyWaiting
                ? Math.max(
                    0,
                    Math.floor((now - waitingStart) / 60_000),
                )
                : appointment.actualWaitingMinutes ?? 0;

            return {
                ...appointment,
                currentWaitingMinutes,
            };
        });

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<AppointmentDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(
                'Invalid appointment ID',
            );
        }

        const appointment = await this.appointmentModel
            .findById(id)
            .populate({
                path: 'patientId',
                select:
                    'fullName preferredName uhid phone gender dateOfBirth',
            })
            .populate({
                path: 'doctorId',
                select:
                    'fullName specialization departmentName opdRoomNumber',
            })
            .exec();

        if (!appointment) {
            throw new NotFoundException(
                'Appointment not found',
            );
        }

        return appointment;
    }

    async markArrived(
        id: string,
    ): Promise<AppointmentDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(
                'Invalid appointment ID',
            );
        }

        const existingAppointment =
            await this.appointmentModel
                .findById(id)
                .select('status startAt')
                .exec();

        if (!existingAppointment) {
            throw new NotFoundException(
                'Appointment not found',
            );
        }

        if (existingAppointment.status !== 'booked') {
            throw new ConflictException(
                `Only a booked appointment can be marked as arrived. Current status: ${existingAppointment.status}`,
            );
        }

        const arrivedAt = new Date();

        const waitingStartedAt =
            existingAppointment.startAt.getTime() >
                arrivedAt.getTime()
                ? existingAppointment.startAt
                : arrivedAt;

        const appointment =
            await this.appointmentModel
                .findOneAndUpdate(
                    {
                        _id: id,
                        status: 'booked',
                    },
                    {
                        $set: {
                            status: 'arrived',
                            arrivedAt,
                            waitingStartedAt,
                        },
                        $push: {
                            statusHistory: {
                                fromStatus: 'booked',
                                toStatus: 'arrived',
                                changedAt: arrivedAt,
                                reason: 'Patient arrived at hospital',
                            },
                        },
                    },
                    {
                        new: true,
                        runValidators: true,
                    },
                )
                .populate({
                    path: 'patientId',
                    select:
                        'fullName preferredName uhid phone gender dateOfBirth',
                })
                .populate({
                    path: 'doctorId',
                    select:
                        'fullName specialization departmentName opdRoomNumber',
                })
                .exec();

        if (!appointment) {
            throw new ConflictException(
                'Appointment status changed during the arrival operation',
            );
        }

        return appointment;
    }

    private validateAppointmentTimes(
        startAt: Date,
        endAt: Date,
    ): void {
        if (
            Number.isNaN(startAt.getTime()) ||
            Number.isNaN(endAt.getTime())
        ) {
            throw new BadRequestException(
                'Invalid appointment date or time',
            );
        }

        if (startAt.getTime() <= Date.now()) {
            throw new BadRequestException(
                'Appointment start time must be in the future',
            );
        }

        if (endAt.getTime() <= startAt.getTime()) {
            throw new BadRequestException(
                'Appointment end time must be after its start time',
            );
        }

        const durationMinutes =
            (endAt.getTime() - startAt.getTime()) / 60_000;

        if (durationMinutes < 5 || durationMinutes > 480) {
            throw new BadRequestException(
                'Appointment duration must be between 5 and 480 minutes',
            );
        }
    }

    private generateAppointmentNumber(): string {
        const year = new Date().getUTCFullYear();

        const uniquePart = randomUUID()
            .replaceAll('-', '')
            .slice(0, 10)
            .toUpperCase();

        return `APT-${year}-${uniquePart}`;
    }
}