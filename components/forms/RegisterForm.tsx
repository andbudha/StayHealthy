'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl } from '@/components/ui/form';
import CustomFormField from '../CustomFormField';
import SubmitButton from '../SubmitButton';
import { useState } from 'react';
import { PatientFormValidation } from '@/lib/validation';
import { useRouter } from 'next/navigation';
import { FormFieldType } from './PatientForm';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Doctors,
  GenderOptions,
  IdentificationTypes,
  PatientFormDefaultValues,
} from '@/constants';
import { Label } from '../ui/label';
import { SelectItem } from '../ui/select';
import Image from 'next/image';
import FileUploader from '../FileUploader';
import { registerPatient } from '@/lib/actions/patient.actions';

const RegisterForm = ({ user }: { user: User }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof PatientFormValidation>) => {
    setIsLoading(true);
    let formData;
    if (
      values.identificationDocument &&
      values.identificationDocument.length > 0
    ) {
      const blobFile = new Blob([values.identificationDocument[0]], {
        type: values.identificationDocument[0].type,
      });
      formData = new FormData();
      formData.append('blobFile', blobFile);
      formData.append('fileName', values.identificationDocument[0].name);
    }
    try {
      const patientData = {
        ...values,
        userId: user.$id,
        birthDate: new Date(values.birthDate),
        identificationDocument: formData,
      };

      // @ts-ignore
      const patient = await registerPatient(patientData);
      if (patient) {
        console.log('Patient data saved:::', patient);

        router.push(`/patients/${user.$id}/new-appointment`);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-12 flex-1"
        >
          <section className="space-y-4">
            <h1 className="header">Welcome 👋🏻</h1>
            <p className="text-dark-700">Let us know more about yourself.</p>
          </section>
          <section className="space-y-6">
            <div className="mb-9 space-y-1">
              <h2 className="sub-header">Personal Information.</h2>
            </div>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              iconSrc="/assets/icons/user.svg"
              iconAlt="user"
            />
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="email"
                label="Email"
                placeholder="johndoe@email.com"
                iconSrc="/assets/icons/email.svg"
                iconAlt="email"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.PHONE_INPUT}
                name="phone"
                label="Phone Number"
                placeholder="+(012) 345-678"
              />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.DATE_PICKER}
                name="birthDate"
                label="Date of Birth"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SKELETON}
                name="gender"
                label="Gender"
                renderSkeleton={(field) => (
                  <FormControl>
                    <RadioGroup
                      className="flex h-11 gap-6 xl:justify-between"
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      {GenderOptions.map((option) => (
                        <div key={option} className="radio-group">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="address"
                label="Address"
                placeholder="Your Address"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="occupation"
                label="Occupation"
                placeholder="Your Occupation"
              />
            </div>{' '}
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="emergencyContactName"
                label="Emergency Contact Name"
                placeholder="Emergency Contact Name"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.PHONE_INPUT}
                name="emergencyContactNumber"
                label="Emergency Contact Number"
                placeholder="+(012) 345-678"
              />
            </div>
          </section>
          <section className="space-y-6">
            <div className="mb-9 space-y-1">
              <h2 className="sub-header">Medical Information.</h2>
            </div>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              name="primaryPhysician"
              label="Primary Physician"
              placeholder="Select a Physician"
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
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="insuranceProvider"
                label="Medical Insurance"
                placeholder="Medical Insurance"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="insurancePolicyNumber"
                label="Medical Insurance Number"
                placeholder="Medical Insurance Number"
              />
            </div>{' '}
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="allergies"
                label="Allergies"
                placeholder="Allergies( if any )"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="currentMedication"
                label="Current Medication"
                placeholder="Current Medication ( if any )"
              />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="pastMedicalHistory"
                label="Past Medical History"
                placeholder="Past Medical History..."
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="familyMedicalHistory"
                label="Family Medical History"
                placeholder="Family Medical History..."
              />
            </div>
          </section>
          <section className="space-y-6">
            <div className="mb-9 space-y-1">
              <h2 className="sub-header">Identification and Verification</h2>
            </div>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              name="identificationType"
              label="Identification Type"
              placeholder="Select Identification Type"
            >
              {IdentificationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </CustomFormField>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="identificationNumber"
              label="Identification Number"
              placeholder="Identification Number..."
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SKELETON}
              name="identificationDocument"
              label="Identification Document"
              renderSkeleton={(field) => (
                <FormControl>
                  <FileUploader files={field.value} onChange={field.onChange} />
                </FormControl>
              )}
            />
          </section>
          <section className="space-y-6">
            <div className="mb-9 space-y-1">
              <h2 className="sub-header">Consent and Privacy</h2>
            </div>
            <CustomFormField
              fieldType={FormFieldType.CHECKBOX}
              control={form.control}
              name="treatmentConsent"
              label="I consent to receive treatment for my health condition."
            />

            <CustomFormField
              fieldType={FormFieldType.CHECKBOX}
              control={form.control}
              name="disclosureConsent"
              label="I consent to the use and disclosure of my health
            information for treatment purposes."
            />

            <CustomFormField
              fieldType={FormFieldType.CHECKBOX}
              control={form.control}
              name="privacyConsent"
              label="I acknowledge that I have reviewed and agree to the
            privacy policy"
            />
          </section>
          <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
