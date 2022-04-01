import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
    Double,
    BaseEntity,
    OneToMany,
    PrimaryColumn,
} from "typeorm";
@Entity("lsqentry")
export class LQSEntry extends BaseEntity {
    LsqLeads() { }
    // @PrimaryGeneratedColumn("uuid")
    @PrimaryColumn()
    id: string;
    @Column("text")
    studentID: string;
    @Column("text")
    firstName: string;
    @Column("text")
    lastName: string;
    @Column("text")
    pfirstName: string;
    @Column("text")
    plastName: string;
    @Column({ 'nullable': true, type: "date" })
    dob: Date;
    @Column({ 'nullable': true })
    phoneNumber: string;
    @Column({ 'nullable': true })
    whatsapp: string;
    @Column({ 'nullable': true })
    alternativeMobile: string;
    @Column("text")
    email: string;
    @Column({ 'nullable': true })
    address: string;
    @Column({ 'nullable': true })
    saleType: string;
    @Column({ 'nullable': true })
    course: string;
    @Column({ 'nullable': true })
    courseFrequency: string;
    @Column({ 'nullable': true })
    timings: string;
    @Column({ 'nullable': true })
    startingLevel: string;
    @Column({ 'nullable': true, type: "date" })
    startDate: Date;
    @Column({ 'nullable': true, type: "date" })
    dateofsale: Date;
    @Column({ 'nullable': true, type: "text" })
    classessold: string;
    @Column({ type: "text" })
    saleamount: string;
    @Column({ type: "text" })
    downpayment: string;
    @Column({ type: "text" })
    emi: string;
    @Column({ type: "text" })
    emiMonths: string;
    @Column({ type: "text" })
    paymentMode: string;
    @Column({ type: "text" })
    transactionID: string;
    @Column({ type: "text" })
    status: string;
    @Column({ type: "text" })
    customerEmail: string
    @Column({ type: "text" })
    customerAddressState: string
    @Column({ type: "text" })
    subscription: string;
    @Column({ type: "text" })
    salesowner: string;
    @Column({ type: "text" })
    subscriptionNo: string;
    @Column("text")
    lsqstatus: string;
    @Column()
    retry : number;
    @Column({ type: "text" })
    bdaComments: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}