import { Connection, Types } from "mongoose";
import { getPatientModel } from "@/models/Patient";
import { getTestModel } from "@/models/Test";
import { getPaymentModel } from "@/models/Payment";

/**
 * A small, realistic starting dataset so the demo never looks like an
 * empty shell right after a reset - one completed test (with a real
 * result, so the dashboard/report views have something to render) and
 * one still awaiting payment (so that part of the workflow is visible
 * too), plus a patient with no tests yet to try ordering against.
 */
export async function seedDemoSampleData(
  connection: Connection,
  demoUserId: Types.ObjectId | string
): Promise<void> {
  const Patient = getPatientModel(connection);
  const Test = getTestModel(connection);
  const Payment = getPaymentModel(connection);
  const stamp = Date.now();

  const completedPatient = await Patient.create({
    firstname: "Ada",
    lastname: "Okoye",
    dob: "1994-03-12",
    gender: "Female",
    address: "12 Allen Avenue",
    city: "Lagos",
    country: "Nigeria",
    phone: "08010000001",
    email: `ada.demo.${stamp}@example.com`,
  });

  const completedTest = await Test.create({
    test_title: "PCV",
    test_data: JSON.stringify([
      {
        parameter: {
          id: "1_2_0_0",
          name: "PCV",
          resultType: "numeric",
          unit: ["%"],
          range: "36-46",
          value: "41",
          selectedunit: "%",
        },
      },
    ]),
    specimen: "Whole Blood",
    clinical_diagnosis: "Routine checkup",
    status: "Test Completed",
    patient: completedPatient._id,
    user: demoUserId,
    total_cost: 2000,
  });

  const payment = await Payment.create({
    invoice: `DEMO-${stamp}`,
    amount_paid: 2000,
    payment_option: "cash",
    test: completedTest._id,
    user: demoUserId,
  });

  await Test.findByIdAndUpdate(completedTest._id, { payment: payment._id });
  await Patient.findByIdAndUpdate(completedPatient._id, {
    $push: { tests: completedTest._id },
  });

  const awaitingPaymentPatient = await Patient.create({
    firstname: "Tunde",
    lastname: "Balogun",
    dob: "1988-07-21",
    gender: "Male",
    address: "5 Marina Road",
    city: "Lagos",
    country: "Nigeria",
    phone: "08010000002",
    email: `tunde.demo.${stamp}@example.com`,
  });

  const awaitingPaymentTest = await Test.create({
    test_title: "Cholesterol",
    test_data: JSON.stringify([
      {
        parameter: {
          id: "1_2_3_0",
          name: "Cholesterol",
          resultType: "numeric",
          unit: ["mg/dL"],
          range: "<200",
          value: "",
        },
      },
    ]),
    specimen: "Serum",
    clinical_diagnosis: "Lipid profile",
    status: "Awaiting Payment",
    patient: awaitingPaymentPatient._id,
    user: demoUserId,
    total_cost: 3500,
  });

  await Patient.findByIdAndUpdate(awaitingPaymentPatient._id, {
    $push: { tests: awaitingPaymentTest._id },
  });

  await Patient.create({
    firstname: "Chiamaka",
    lastname: "Eze",
    dob: "2001-11-02",
    gender: "Female",
    address: "9 Ikorodu Road",
    city: "Lagos",
    country: "Nigeria",
    phone: "08010000003",
    email: `chiamaka.demo.${stamp}@example.com`,
  });
}
