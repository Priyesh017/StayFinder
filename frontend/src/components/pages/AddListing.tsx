import { useState } from "react";
import API from "../../../../backend/src/services/api";
import { useNavigate } from "react-router-dom";

export default function AddListing() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    location: "",
    price: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await API.post("/listings", { ...form, price: parseFloat(form.price) });
    navigate("/");
  };

  return (
    <div>
      <h2>Add Listing</h2>
      {Object.keys(form).map((key) => (
        <input
          key={key}
          placeholder={key}
          value={(form as any)[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
