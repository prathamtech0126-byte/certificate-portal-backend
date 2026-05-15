CREATE TABLE "student_certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"certificateUrl" text NOT NULL,
	"uploadedBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"fullName" text NOT NULL,
	"mobile" text,
	"email" text,
	"courseName" text,
	"instituteName" text,
	"isVerified" boolean DEFAULT true NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_studentId_unique" UNIQUE("studentId")
);
--> statement-breakpoint
CREATE TABLE "verification_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"checkedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text
);
--> statement-breakpoint
ALTER TABLE "student_certificates" ADD CONSTRAINT "student_certificates_studentId_students_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_certificates" ADD CONSTRAINT "student_certificates_uploadedBy_users_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_studentId_students_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."JobType";