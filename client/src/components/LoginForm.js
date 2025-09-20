import LoginBase from './auth/LoginBase';
export default function LoginForm(){
  return <LoginBase role="student" apiPath="/auth/login" onSuccessRedirect="/student-dashboard" />;
}