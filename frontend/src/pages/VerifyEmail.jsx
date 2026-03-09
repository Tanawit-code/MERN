import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {

  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {

    const token = searchParams.get("token");

    const verifyEmail = async () => {
      try {

        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-email?token=${token}`
        );

        setMessage(res.data.message);

      } catch (error) {
        setMessage("Verification failed");
      }
    };

    verifyEmail();

  }, []);

  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
}

export default VerifyEmail;