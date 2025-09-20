import RegisterBase from './auth/RegisterBase';
export default function RegistrationForm(){
  return <RegisterBase role="student" apiPath="/auth/register" onSuccessRedirect="/login" />;
}