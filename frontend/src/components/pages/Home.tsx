import { useEffect, useState } from "react";
import API from "../../../../backend/src/services/api";
import { Link } from "react-router-dom";

export default function Home() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    API.get("/listings").then((res) => setListings(res.data));
  }, []);

  return (
    <div>
      <h1>All Listings</h1>
      <div>
        {listings.map((listing) => (
          <Link key={listing.id} to={`/listings/${listing.id}`}>
            <div>
              <img src={listing.imageUrl} width="300" />
              <h3>{listing.title}</h3>
              <p>
                {listing.location} - ${listing.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
