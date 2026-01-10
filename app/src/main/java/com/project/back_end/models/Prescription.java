package com.project.back_end.models;

@Document(collection = "prescriptions")
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    @Size(min = 3, max = 100)
    private String patientName;

    @NotNull
    private long appointmentId;

    @NotNull
    @Size(min = 3, max = 100)
    private String medication;

    @Size(max = 200)
    private String dosage;

    @Size(max = 200)
    private String doctorNotes;

    public Prescription() {}

    public Prescription(patientName, medication, dosage, doctorNotes, appointmentId) {
        this.patientName = patientName;
        this.medication = medication;
        this.dosage = dosage;
        this.doctorNotes = doctorNotes;
        this.appointmentId = appointmentId;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

}
