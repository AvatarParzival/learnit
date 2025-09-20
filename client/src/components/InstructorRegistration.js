import RegisterBaseInstructor from "./auth/RegisterBaseInstructor";
export default function InstructorRegistration() {
  return (
    <RegisterBaseInstructor
      apiPath="/auth/register"
      onSuccessRedirect="/login/instructor"
    />
  );
}