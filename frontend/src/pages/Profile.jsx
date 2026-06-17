import { useParams } from "react-router-dom";
import ProfileForm from "../component/ProfileForm";
import ChangePassword from "../component/ChangePassword";

export default function Profile() {
    const { id } = useParams();

    return (
        <div className="d-flex flex-column align-items-center gap-4 mt-4">
            <ProfileForm id={id} />
            <ChangePassword />
        </div>
    );
}