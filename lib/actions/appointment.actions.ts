'use server';
import { ID, Query } from 'node-appwrite';
import { databases, messaging } from '../appwrite.config';
import { formatDateTime, parseStringify } from '../utils';
import { Appointment } from '@/types/appwrite.types';
import { revalidatePath } from 'next/cache';

export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPOINTMENTS_COLLECTION_ID!,
      ID.unique(),
      appointment
    );
    return parseStringify(newAppointment);
  } catch (error) {
    console.log('CREATING APPOINTMENT ERROR:::', error);
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPOINTMENTS_COLLECTION_ID!,
      appointmentId
    );
    return appointment;
  } catch (error) {
    console.log('GETTING APPOINTMENT ERROR:::', error);
  }
};

export const getRecentAppontmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPOINTMENTS_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')]
    );
    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case 'scheduled':
            acc.scheduledCount++;
            break;
          case 'pending':
            acc.pendingCount++;
            break;
          case 'cancelled':
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.log('GETTING RECENT APPOINTMENT LIST:::', error);
  }
};

export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  console.log('APPOINTMENT DETAILS:::', appointment);

  try {
    const updatedAppointment = await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPOINTMENTS_COLLECTION_ID!,
      appointmentId,
      appointment
    );
    if (!updatedAppointment) {
      throw new Error('Appointment not found!');
    }
    const smsMessage = `Hi, it's StayHealthy. ${
      type === 'schedule'
        ? `Your appointment has been scheduled for ${
            formatDateTime(appointment.schedule!).dateTime
          } with Dr.${appointment.primaryPhysician}`
        : `We regret to inform you that your apointment has been cancelled!. 
        Reason: ${appointment.cancellationReason!}`
    }
  `;

    await sendSMSNotification(userId, smsMessage);
    //SMS notification
    revalidatePath('/admin');
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.log('UPDATING APPOINTMENT ERROR:::', error);
  }
};

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
  } catch (error) {
    console.log('SENDING SMS TOTIFICATION ERROR:::', error);
  }
};
