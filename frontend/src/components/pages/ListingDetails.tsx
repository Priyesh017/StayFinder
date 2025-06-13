import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../../../backend/src/services/api";
import { useAuth } from "../../../../backend/src/services/AuthContext";

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    API.get(`/listings/${id}`).then((res) => setListing(res.data));
  }, [id]);

  const handleBooking = async () => {
    await API.post("/bookings", {
      listingId: listing.id,
      startDate,
      endDate,
    });
    alert("Booking successful");
  };

  if (!listing) return <p>Loading...</p>;

  return (
    <div>
      <img src={listing.imageUrl} width="500" />
      <h2>{listing.title}</h2>
      <p>{listing.description}</p>
      <p>
        {listing.location} | ${listing.price} per night
      </p>

      {user && (
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button onClick={handleBooking}>Book Now</button>
        </div>
      )}
    </div>
  );
}
