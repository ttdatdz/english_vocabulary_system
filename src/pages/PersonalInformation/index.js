import ChangePasswordForm from "../../components/ChangePasswordForm";
import PersonalInformationForm from "../../components/PersonalInformationForm";
import "./PersonalInformation.scss";
export default function PersonalInformation() {
  return (
    <div className="Container-PersionalForm">
      <h2 className="PageTitle">Personal Information</h2>
      <PersonalInformationForm />
      <ChangePasswordForm />
    </div>
  );
}
