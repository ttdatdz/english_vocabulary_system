import ChangePasswordForm from "../../components/ChangePasswordForm";
import PersonalInformationForm from "../../components/PersonalInformationForm";
import "./PersonalInformation.scss";
export default function PersonalInformation() {
  const role = localStorage.getItem("role");
  console.log("Role:", role);
  return (
    <div className={role === "ADMIN" ? "" : "MainContainer"}>
      <div className={role === "ADMIN" ? "" : "PersonalInformation"}>
        <h2 className="PageTitle">Personal Information</h2>
        <PersonalInformationForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
