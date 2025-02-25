import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Document,
  Image,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { logEvent } from "../../actions/analyticsActions";
import { orderDetail as orderDetailAction } from "../../actions/orderActions";
// import lod from "../../images/logo.png";
import Loader from "../layouts/Loader";
import "./OrderDetail.css";

export default function OrderDetail() {
  const { orderDetail, loading } = useSelector((state) => state.orderState);
  const {
    shippingInfo = {},
    billingInfo = {},
    user = {},
    orderStatus = "Processing",
    orderItems = [],
    totalPrice = 0,
    paymentInfo = {},
    createdAt = 0,
  } = orderDetail;
  const isPaid =
    paymentInfo && paymentInfo.status === "succeeded" ? true : false;
  const dispatch = useDispatch();
  const { id } = useParams();
  const [generatePdf, setGeneratePdf] = useState(false);
  const [progress, setProgress] = useState(); // Initial progress

  const date = new Date(createdAt);

  // Add 7 days to the date
  date.setDate(date.getDate() + 7);

  // Format the date as D - M - YYYY
  const day = date.getDate();
  const month = date.getMonth() + 1; // months are 0-indexed, so add 1
  const year = date.getFullYear();

  // Format it in "D - M - YYYY" format
  const formattedDate = `${day} - ${month} - ${year}`;

  useEffect(() => {
    // Update progress based on orderStatus
    switch (orderStatus) {
      case "Processing":
        setProgress(17);
        break;
      case "Shipped":
        setProgress(50);
        break;
      case "Delivered":
        setProgress(99);
        break;
      default:
        setProgress(0); // Default to initial progress
        break;
    }
  }, [orderStatus]);
  const handleGeneratePdf = () => {
    setGeneratePdf(true);
  };

  useEffect(() => {
    dispatch(orderDetailAction(id));
  }, [id, dispatch]);

  const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    heading: {
      fontSize: 20,
      marginBottom: 10,
    },
    subheading: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 10,
      marginBottom: 5,
    },
    greenColor: {
      color: "green",
    },
    redColor: {
      color: "red",
    },
    tableContainer: {
      marginTop: 10,
      border: "1px solid #000",
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: "1px solid #000",
      padding: 5,
    },
    tableCell: {
      width: "35%",
      padding: 3,
      fontSize: 10,
    },
    image: {
      height: "50",
      width: "50",
      marginHorizontal: "45%",
    },
  });
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const timeSpent = (Date.now() - startTime) / 1000;
      logEvent({
        event: "page_view",
        pageUrl: window.location.pathname,
        timeSpent,
      });
    };
  }, []);

  const OrderDetailPDF = ({ orderDetail }) => (
    <Document>
      <Page size="A4">
        <View style={styles.container}>
          {/* <Image src={lod} style={styles.image} /> */}
          <Text style={styles.heading}>Order #{orderDetail._id}</Text>

          <Text style={styles.subheading}>Shipping Info</Text>
          <Text>Name: {orderDetail.user.name}</Text>
          <Text>Phone: {orderDetail.shippingInfo.phoneNo}</Text>
          <Text>
            Address: {orderDetail.shippingInfo.address},{" "}
            {orderDetail.shippingInfo.city},{" "}
            {orderDetail.shippingInfo.postalCode},{" "}
            {orderDetail.shippingInfo.state}, {orderDetail.shippingInfo.country}
          </Text>
          <Text style={styles.subheading}>Billing Info</Text>
          <Text>Name: {orderDetail.user.name}</Text>
          <Text>Phone: {orderDetail.billingInfo.phoneNo}</Text>
          <Text>
            Address: {orderDetail.billingInfo.address},{" "}
            {orderDetail.billingInfo.city}, {orderDetail.billingInfo.postalCode}
            , {orderDetail.billingInfo.state}, {orderDetail.billingInfo.country}
          </Text>
          <Text>Amount: RS.{orderDetail.totalPrice}</Text>

          <Text style={styles.subheading}>Payment</Text>
          <Text
            style={
              orderDetail.paymentInfo &&
              orderDetail.paymentInfo.status === "paid"
                ? styles.greenColor
                : styles.redColor
            }
          >
            {orderDetail.paymentInfo &&
            orderDetail.paymentInfo.status === "paid"
              ? "PAID"
              : "NOT PAID"}
          </Text>

          <Text style={styles.subheading}>Order Status</Text>
          <Text
            style={
              orderDetail.orderStatus &&
              orderDetail.orderStatus.includes("Delivered")
                ? styles.greenColor
                : styles.redColor
            }
          >
            {orderDetail.orderStatus}
          </Text>

          <Text style={styles.subheading}>Order Items</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>ID</Text>
              <Text style={styles.tableCell}>HSN</Text>
              <Text style={styles.tableCell}>Name</Text>
              <Text style={styles.tableCell}>Price</Text>
              <Text style={styles.tableCell}>Quantity</Text>
            </View>
            {orderDetail.orderItems &&
              orderDetail.orderItems.map((item) => (
                <View key={item._id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.product}</Text>
                  <Text style={styles.tableCell}>202456</Text>
                  <Text style={styles.tableCell}>{item.name}</Text>
                  <Text style={styles.tableCell}>RS.{item.price}</Text>
                  <Text style={styles.tableCell}>{item.quantity} Piece(s)</Text>
                </View>
              ))}
          </View>
        </View>
      </Page>
    </Document>
  );

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          {/* ORDER TRACKING */}
          <section className="container order-tracking-section-procureg mt-5">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">My Orders / Tracking</h6>

                <hr />
                <div
                  className="d-flex"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 class="card-title2">Order ID :{orderDetail._id} </h5>
                  <h5 class="card-title2">Total Amount :₹{totalPrice} </h5>
                </div>

                <div className="order-tracking-box-contents-procureg">
                  <div className="row">
                    <div className="col-lg-3">
                      <div className="">
                        <h5>Estimated time of delivery</h5>
                        <p>{formattedDate}</p>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="">
                        <h5>Delivering to</h5>
                        <p>
                          {shippingInfo.address}, {shippingInfo.city},{" "}
                          {shippingInfo.postalCode}, {shippingInfo.state},{" "}
                          {shippingInfo.country}{" "}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="">
                        <h5>Status</h5>
                        <p>{orderStatus}</p>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="">
                        <h5>Tracking #:</h5>
                        <p>BD4696366266 </p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="order-tracking-2nd-hr mt-5" />

                <div style={{ margin: "3% 0" }}>
                  <div
                    className="progress"
                    style={{ backgroundColor: "#fff", height: "7px" }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progress}%` }}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>

                <div class="d-flex justify-content-around order-tracking-progress-contents-procureg">
                  <div className="col-lg-4">
                    <div>
                      <FontAwesomeIcon icon={faCheck} className="iconnn" />
                      <h6>Order Confirmed</h6>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div>
                      <FontAwesomeIcon icon={faCheck} className="iconnn" />
                      <h6>Shipped</h6>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div>
                      <FontAwesomeIcon icon={faCheck} className="iconnn" />
                      <h6>Delivered</h6>
                    </div>
                  </div>
                </div>

                <div className="order-tracking-pdf-contents-procureg">
                  {orderItems &&
                    orderItems.map((item) => (
                      <div class="card col-3 mb-3 ">
                        <div class="card-body">
                          <div className="row">
                            <div className="col-lg-3">
                              <img
                                class="card-img-top"
                                src={item.image}
                                alt={item.name}
                              />
                            </div>
                            <div
                              className="col-lg-9"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                              }}
                            >
                              <div>
                                <Link to={`/products/${item.product}`}>
                                  {item.name}
                                </Link>
                                <p>₹{item.price}</p>
                                <p>{item.quantity} Piece(s)</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="order-tracking-buttons-procureg">
                  {loading ? (
                    <Loader />
                  ) : generatePdf ? (
                    <PDFDownloadLink
                      document={<OrderDetailPDF orderDetail={orderDetail} />}
                      fileName={`${orderDetail._id}.pdf`}
                      className="btn-primary"
                    >
                      {({ blob, url, loading, error }) =>
                        loading ? "Loading..." : "Click to download Invoice"
                      }
                    </PDFDownloadLink>
                  ) : orderDetail.orderStatus === "Delivered" ? (
                    <button onClick={handleGeneratePdf} className="">
                      Generate Invoice
                    </button>
                  ) : null}{" "}
                  {/* This will hide the button if the status is not 'Delivered' */}
                  <button>Back to home</button>
                </div>
              </div>
            </div>
          </section>

          {/* original */}
        </Fragment>
      )}
    </Fragment>
  );
}
