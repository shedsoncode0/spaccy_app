import axios from "axios";
import { createContext, useContext, useState } from "react";
import env from "../constants/env";
import { AuthContext } from "./AuthContext";

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [getBookingsIsLoading, setGetBookingsIsLoading] = useState(false);
  const [enquireNowDetails, setEnquireNowDetails] = useState({
    layout: "",
    people: 0,
    message: "",
    flexible: false,
    dateAndTime: {
      date: "",
      startTime: "",
      endTime: "",
    },
  });

  const getBookings = () => {
    setGetBookingsIsLoading(true);
    axios
      .get(`${env.API_URL}/booking/${user.data._id}/all`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      .then((res) => {
        setGetBookingsIsLoading(false);
        setBookings(res.data.data);
      })
      .catch((err) => {
        console.log(err);
        setGetBookingsIsLoading(false);
      });
  };

  const bookaSpace = (spaceDetails, type) => {
    const details = {
      status: "pending",
      eventTitle: user?.data.firstName,
      service: {
        spaceLayout: enquireNowDetails.layout,
        type: type || "space",
        serviceId: spaceDetails._id,
        serviceOwnerId: spaceDetails.ownedBy,
        price: spaceDetails.pricing.fee,
      },
      client: {
        ...user?.data,
        message: enquireNowDetails.message,
        flexible: false,
      },
      event: {
        type: "cecece",
        numberOfGuests: enquireNowDetails.people,
        endTime: enquireNowDetails.dateAndTime.endTime,
        startTime: enquireNowDetails.dateAndTime.startTime,
        date: enquireNowDetails.dateAndTime.date,
      },
    };
    // Add data to formData
    const value = { data: JSON.stringify(details) };

    axios
      .post(`${env.API_URL}/booking/new`, value, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setBookingSuccess(true);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  const bookaVendor = (vendorDetails) => {
    const businessInfo = vendorDetails;
    const { fullDay, hourly, perHead, perItem, other } =
      businessInfo.paymentPlan;

    const details = {
      status: "pending",
      eventTitle: user?.data.firstName + " " + user?.data.lastName,
      service: {
        spaceLayout: enquireNowDetails.layout,
        type: "vendor",
        serviceId: businessInfo._id,
        serviceOwnerId: businessInfo.userId,
        price:
          fullDay.price ||
          hourly.price ||
          other.price ||
          perHead.price ||
          perItem.price,
      },
      client: {
        ...user?.data,
        message: enquireNowDetails.message,
        flexible: false,
      },
      event: {
        type: searchValue,
        numberOfGuests: enquireNowDetails.people,
        endTime: enquireNowDetails.dateAndTime.endTime,
        startTime: enquireNowDetails.dateAndTime.startTime,
        date: enquireNowDetails.dateAndTime.date,
      },
    };
    // Add data to formData
    const value = { data: JSON.stringify(details) };

    axios
      .post(`${env.API_URL}/booking/new`, value, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  const enquireNow = () => {
    console.log(enquireNowDetails);
  };
  return (
    <BookingContext.Provider
      value={{
        getBookings,
        getBookingsIsLoading,
        bookings,
        enquireNow,
        enquireNowDetails,
        setEnquireNowDetails,
        bookaSpace,
        searchValue,
        setSearchValue,
        bookaVendor,
        setBookingSuccess,
        bookingSuccess,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
