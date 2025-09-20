import LoginBase from './auth/LoginBase';
export default function InstructorLogin(){
  return <LoginBase role="instructor" apiPath="/auth/login" onSuccessRedirect="/instructor-dashboard" />;
}