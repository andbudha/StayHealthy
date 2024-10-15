'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import CustomFormField from '../CustomFormField';
import SubmitButton from '../SubmitButton';
import { useState } from 'react';
import { getAppointmentSchema } from '@/lib/validation';
import { useRouter } from 'next/navigation';
import { FormFieldType } from './PatientForm';
import { Doctors } from '@/constants';
import { SelectItem } from '../ui/select';
import Image from 'next/image';
import { createAppointment } from '@/lib/actions/appointment.actions';

type AppointmentFormProps = {
  type: 'create' | 'cancel' | 'schedule';
  userId: string;
  patientId: string;
};
const AppointmentForm = ({ type, userId, patientId }: AppointmentFormProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: '',
      schedule: new Date(),
      reason: '',
      note: '',
      cancellationReason: '',
    },
  });

  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    setIsLoading(true);

    let status;
    switch (type) {
      case 'cancel':
        status = 'cancelled';
        break;
      case 'schedule':
        status = 'scheduled';
        break;

      default:
        status = 'pending';
        break;
    }

    try {
      if (type === 'create' && patientId) {
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          note: values.note,
          status: status as Status,
        };
        const appointment = await createAppointment(appointmentData);
        if (appointment) {
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`
          );
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  let buttonLabel;

  switch (type) {
    case 'cancel':
      buttonLabel = 'Cancel Appointment';
      break;
    case 'create':
      buttonLabel = 'Create Appointment';
      break;
    case 'schedule':
      buttonLabel = 'Schedule Appointment';
      break;
    default:
      break;
  }
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 flex-1"
        >
          <section className="mb-12 space-y-4">
            <h1 className="">New Appointment 👋🏻</h1>
            <p className="text-dark-700">Request a new appointment:</p>
          </section>
          {type !== 'cancel' && (
            <>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="primaryPhysician"
                label="Doctor"
                placeholder="Select a Doctor"
              >
                {Doctors.map((doctor) => (
                  <SelectItem key={doctor.name} value={doctor.name}>
                    <div className="flex cursor-pointer items-center gap-2">
                      <Image
                        src={doctor.image}
                        width={32}
                        height={32}
                        alt={doctor.name}
                        className="rounded-full border border-dark-500"
                      />
                      <p>{doctor.name}</p>
                    </div>
                  </SelectItem>
                ))}
              </CustomFormField>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.DATE_PICKER}
                name="schedule"
                label="Expected appointment date"
                showTimeSelect
                dateFormat="dd/MM/yyyy - h:mm aa"
              />
              <div className="flex flex-col gap-6 xl:flex-row">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="reason"
                  label="Appointment Reason"
                  placeholder="Enter appointment reason..."
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="note"
                  label="Notes"
                  placeholder="Enter notes..."
                />
              </div>
            </>
          )}
          {type === 'cancel' && (
            <>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="cancellationReason"
                label="Cancellation Reason"
                placeholder="Enter cancellation reason..."
              />
            </>
          )}
          <SubmitButton
            isLoading={isLoading}
            className={`${
              type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn'
            } w-full`}
          >
            {buttonLabel}
          </SubmitButton>
        </form>
      </Form>
    </div>
  );
};

export default AppointmentForm;