
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  addBooking,
  createPaymentOrder,
  verifyPayment,
} from "../Api";

// ================= CUSTOMER DETAILS =================

const getCustomer = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("loggedInUser") || "{}") || {}
    );
  } catch {
    return {};
  }
};

// ================= RAZORPAY SCRIPT =================

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const Payment = () => {
  const navigate = useNavigate();
  const locationState = useLocation();

  const booking = locationState.state?.booking || {};
  const customer = getCustomer();

  // ================= STATE =================

  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const [savedBooking, setSavedBooking] = useState(null);
  const [savedPayment, setSavedPayment] = useState(null);
  const [paidBooking, setPaidBooking] = useState(null);

  const [error, setError] = useState("");

  // ================= BOOKING DETAILS =================

  const eventTitle =
    booking.eventTitle ||
    booking.eventName ||
    booking.name ||
    booking.title ||
    "";

  const userName =
    booking.userName ||
    customer.name ||
    customer.userName ||
    customer.fullName ||
    "";

  const email =
    booking.email ||
    booking.userEmail ||
    customer.email ||
    "";

  const eventDate =
    booking.date ||
    booking.bookingDate ||
    booking.eventDate ||
    booking.startDate ||
    "";

  const eventLocation =
    booking.location ||
    booking.eventLocation ||
    booking.venue ||
    "";

  const quantity = Number(
    booking.quantity ?? booking.seats ?? 1
  );

  const unitPrice = Number(
    booking.price ??
      booking.ticketPrice ??
      (booking.amount != null && quantity > 0
        ? Number(booking.amount) / quantity
        : NaN)
  );

  const totalAmount = unitPrice * quantity;

  // ================= DATE FORMAT =================

  const formatDate = (value) => {
    if (!value) return "";

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toISOString();
  };

  // ================= PAYMENT SUBMISSION =================

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    if (loading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      navigate("/Login");
      return;
    }

    if (!eventTitle || !userName || !email || !eventDate || !eventLocation) {
      setError(
        "Booking details incomplete hain. Event, date, location aur user details check karein."
      );
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0 ||
      !Number.isFinite(totalAmount)
    ) {
      setError("Seats aur ticket amount valid nahi hain.");
      return;
    }

    if (!formatDate(eventDate)) {
      setError("Event ki valid date available nahi hai.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select UPI or Card.");
      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // STEP 1: CREATE BOOKING
      // ==========================================

      let bookingDocument = savedBooking;

      if (!bookingDocument) {
        const bookingPayload = {
          userName: userName.trim(),
          email: email.trim().toLowerCase(),

          eventId:
            booking.eventId ||
            booking.event?._id ||
            booking._id ||
            null,

          eventTitle: eventTitle.trim(),
          date: formatDate(eventDate),
          location: eventLocation.trim(),
          quantity,
          price: unitPrice,
        };

        const bookingResponse = await addBooking(bookingPayload);

        bookingDocument =
          bookingResponse.data?.data ||
          bookingResponse.data?.booking ||
          bookingResponse.data;

        if (!bookingDocument?._id) {
          throw new Error(
            bookingResponse.data?.message ||
            "Booking database mein save nahi hui."
          );
        }

        setSavedBooking(bookingDocument);

        localStorage.setItem(
          "latestBooking",
          JSON.stringify(bookingDocument)
        );
      }

      // ==========================================
      // STEP 2: LOAD RAZORPAY CHECKOUT
      // ==========================================

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Razorpay checkout load nahi hua. Internet connection check karein."
        );
      }

      // ==========================================
      // STEP 3: CREATE RAZORPAY ORDER
      // ==========================================

      const orderResponse = await createPaymentOrder({
        bookingId: bookingDocument._id,
        paymentMethod,
      });

      const orderData = orderResponse.data;

      if (
        !orderData?.success ||
        !orderData?.order?.id ||
        !orderData?.key
      ) {
        throw new Error(
          orderData?.message || "Razorpay order create nahi hua."
        );
      }

      // ==========================================
      // STEP 4: OPEN RAZORPAY CHECKOUT
      // ==========================================

      const options = {
        key: orderData.key,

        amount: orderData.order.amount,
        currency: orderData.order.currency,

        name: "Eventzaa",
        description: `Payment for ${eventTitle}`,

        order_id: orderData.order.id,

        prefill: {
          name: userName,
          email: email,
          contact: customer.phone || booking.phone || "",
        },

        notes: {
          bookingId: String(bookingDocument._id),
        },

        theme: {
          color: "#5b4bdb",
        },

        handler: async function (response) {
          try {
            setError("");

            // ======================================
            // STEP 5: VERIFY PAYMENT ON BACKEND
            // ======================================

            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verification = verifyResponse.data;

            if (!verification?.success) {
              throw new Error(
                verification?.message ||
                "Payment verification failed."
              );
            }

            const paymentDocument = verification.payment;

            const confirmedBooking =
              verification.booking || bookingDocument;

            if (!paymentDocument) {
              throw new Error(
                "Payment verified, but payment details were not returned."
              );
            }

            // ======================================
            // STEP 6: UPDATE CONFIRMED BOOKING
            // ======================================

            const updatedBooking = {
              ...confirmedBooking,

              id: confirmedBooking._id,

              eventName:
                confirmedBooking.eventTitle || eventTitle,

              userEmail:
                confirmedBooking.email || email,

              seats:
                confirmedBooking.quantity || quantity,

              amount:
                confirmedBooking.totalAmount ?? totalAmount,

              paymentMethod: paymentDocument.paymentMethod,

              paymentStatus: paymentDocument.paymentStatus,

              paymentId: paymentDocument._id,

              transactionId: paymentDocument.transactionId,

              status: confirmedBooking.status || "Confirmed",

              paymentDate: paymentDocument.paymentDate
                ? new Date(
                    paymentDocument.paymentDate
                  ).toLocaleString()
                : new Date().toLocaleString(),
            };

            setSavedPayment(paymentDocument);
            setPaidBooking(updatedBooking);
            setPaymentCompleted(true);

            localStorage.setItem(
              "latestBooking",
              JSON.stringify(updatedBooking)
            );

            localStorage.setItem(
              "latestPayment",
              JSON.stringify(paymentDocument)
            );

            const oldBookings = JSON.parse(
              localStorage.getItem("bookings") || "[]"
            );

            const otherBookings = Array.isArray(oldBookings)
              ? oldBookings.filter(
                  (item) =>
                    String(item._id) !==
                    String(updatedBooking._id)
                )
              : [];

            localStorage.setItem(
              "bookings",
              JSON.stringify([
                ...otherBookings,
                updatedBooking,
              ])
            );
          } catch (verificationError) {
            console.error(
              "Payment verification error:",
              verificationError
            );

            setError(
              verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        setError(
          response.error?.description ||
          "Payment failed. Please try again."
        );

        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error(
        "Booking/payment error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Booking/payment save nahi hua."
      );

      setLoading(false);
    }
  };

  // ================= PRINT BILL =================

  const printBill = () => {
    window.print();
  };

  // ================= UI =================

  return (
    <div style={styles.page}>
      <div style={styles.paymentBox}>
        <div style={styles.header}>
          {!paymentCompleted && (
            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate(-1)}
            >
              ←
            </button>
          )}

          <h2 style={{ margin: 0 }}>Payment</h2>
        </div>

        {error && (
          <div role="alert" style={styles.error}>
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {paymentCompleted ? (
          <div style={styles.successPanel}>
            <div style={styles.successIcon}>✓</div>

            <h2>Payment Successful!</h2>

            <p style={styles.successText}>
              Your booking and payment have been confirmed.
            </p>

            <div style={styles.bill}>
              <h3>Booking / Payment Bill</h3>

              <Detail label="Customer Name" value={paidBooking?.userName} />

              <Detail
                label="Phone Number"
                value={customer.phone || booking.phone || "Not provided"}
              />

              <Detail label="Email Address" value={paidBooking?.email} />

              <Detail
                label="Booking ID"
                value={paidBooking?._id}
              />

              <Detail
                label="Payment ID"
                value={savedPayment?._id}
              />

              <Detail
                label="Transaction ID"
                value={savedPayment?.transactionId}
              />

              <Detail
                label="Event Name"
                value={paidBooking?.eventTitle}
              />

              <Detail
                label="Seats"
                value={paidBooking?.quantity}
              />

              <Detail
                label="Payment Method"
                value={savedPayment?.paymentMethod}
              />

              <Detail
                label="Payment Status"
                value={savedPayment?.paymentStatus?.toUpperCase()}
              />

              <Detail
                label="Booking Status"
                value={paidBooking?.status}
              />

              <div style={styles.detailRow}>
                <span>Total Amount</span>

                <strong style={styles.amount}>
                  ₹
                  {Number(
                    savedPayment?.amount || totalAmount
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <Detail
                label="Payment Date"
                value={paidBooking?.paymentDate}
              />
            </div>

            <button
              type="button"
              style={styles.printButton}
              onClick={printBill}
            >
              🖨 Print Bill
            </button>

            <button
              type="button"
              style={styles.bookingsButton}
              onClick={() => navigate("/ManageBooking")}
            >
              View My Bookings
            </button>

            <button
              type="button"
              style={styles.backToHome}
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            {/* BOOKING DETAILS */}

            <div style={styles.bookingCard}>
              <h3>Booking Details</h3>

              <Detail label="Event Name" value={eventTitle} />
              <Detail label="User Name" value={userName} />
              <Detail label="Email" value={email} />
              <Detail label="Seats" value={quantity} />
              <Detail label="Event Location" value={eventLocation} />

              <div style={styles.detailRow}>
                <span>Total Amount</span>

                <strong style={styles.amount}>
                  ₹
                  {Number.isFinite(totalAmount)
                    ? totalAmount.toLocaleString("en-IN")
                    : "—"}
                </strong>
              </div>
            </div>

            {/* PAYMENT METHOD */}

            <form onSubmit={handlePayment}>
              <h3 style={styles.paymentTitle}>
                Select Payment Method
              </h3>

              <label style={styles.option}>
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />
                <span>📱 UPI</span>
              </label>

              <label style={styles.option}>
                <input
                  type="radio"
                  name="payment"
                  value="Card"
                  checked={paymentMethod === "Card"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />
                <span>💳 Debit / Credit Card</span>
              </label>

              <p style={styles.demoNote}>
                Secure payment is processed through Razorpay Checkout.
                Never share your UPI PIN, card PIN or OTP with anyone.
              </p>

              <button
                type="submit"
                style={{
                  ...styles.payButton,
                  opacity: loading ? 0.7 : 1,
                }}
                disabled={loading}
              >
                {loading
                  ? "Opening Secure Payment..."
                  : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ================= DETAIL COMPONENT =================

const Detail = ({ label, value }) => (
  <div style={styles.detailRow}>
    <span>{label}</span>
    <strong>
      {value == null || value === "" ? "—" : value}
    </strong>
  </div>
);

// ================= STYLES =================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 15px",
    boxSizing: "border-box",
  },

  paymentBox: {
    width: "100%",
    maxWidth: "600px",
    background: "#fff",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 5px 25px rgba(0,0,0,0.12)",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  backButton: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "50%",
    background: "#eee",
    fontSize: "22px",
    cursor: "pointer",
  },

  bookingCard: {
    background: "#f8f9fa",
    borderRadius: "10px",
    padding: "18px",
    marginBottom: "25px",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "9px 0",
    borderBottom: "1px solid #e5e5e5",
    gap: "15px",
    overflowWrap: "anywhere",
  },

  amount: {
    fontSize: "20px",
    color: "#198754",
  },

  paymentTitle: {
    marginBottom: "15px",
  },

  successPanel: {
    textAlign: "center",
  },

  successIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#198754",
    color: "#fff",
    fontSize: "42px",
    lineHeight: "64px",
  },

  successText: {
    color: "#198754",
    fontWeight: "600",
  },

  bill: {
    margin: "25px 0",
    padding: "18px",
    border: "1px solid #d9dee3",
    borderRadius: "10px",
    textAlign: "left",
  },

  printButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#198754",
    color: "#fff",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  bookingsButton: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    border: "1px solid #0d6efd",
    borderRadius: "8px",
    background: "#fff",
    color: "#0d6efd",
    fontSize: "16px",
    cursor: "pointer",
  },

  backToHome: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#eee",
    color: "#222",
    fontSize: "16px",
    cursor: "pointer",
  },

  option: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },

  demoNote: {
    color: "#666",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  error: {
    background: "#fff0f0",
    border: "1px solid #e5a0a0",
    color: "#b42318",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  payButton: {
    width: "100%",
    padding: "14px",
    marginTop: "15px",
    border: "none",
    borderRadius: "8px",
    background: "#0d6efd",
    color: "#fff",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Payment;
