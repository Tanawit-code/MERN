import { useState, useEffect } from "react";
import { updateProfileApi, getMyProfileApi } from "../services/userApi";

function ProfilePage({ currentUserId }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profilePic, setProfilePic] = useState(null); // สำหรับ preview
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyProfileApi();
                setName(res.data.user.name);
                setEmail(res.data.user.email);
                setProfilePic(res.data.user.profilePic);
            } catch (error) {
                console.log(error);
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setProfilePic(URL.createObjectURL(e.target.files[0]));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        if (file) formData.append("profilePic", file);

        try {
            const res = await updateProfileApi(formData);
            alert(res.data.message);
        } catch (error) {
            alert(error.response?.data?.message || "อัปเดตไม่สำเร็จ");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
            <h2>แก้ไขข้อมูลส่วนตัว</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {profilePic && (
                    <img
                        src={profilePic}
                        alt="Profile"
                        style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
                    />
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <input
                    type="text"
                    placeholder="ชื่อ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="อีเมล"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" style={{ padding: "10px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "8px" }}>
                    บันทึก
                </button>
            </form>
        </div>
    );
}

export default ProfilePage;