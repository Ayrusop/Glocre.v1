import { Fragment, useEffect, useState } from "react"
import { Button } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { deleteReview, getReviews } from "../../actions/productActions"
import { clearError, clearReviewDeleted } from "../../slices/singleProductSlice"
import Loader from '../layouts/Loader';
import { MDBDataTable } from 'mdbreact';
import { toast } from 'react-toastify'
import Sidebar from "./Sidebar"
import './reviewlist.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"
import avatar1 from '../../images/OIP.jpg'
import { faCartShopping, faCheck, faMoneyBillTrendUp, faUpload, faUser, faFilter, faPencil, faSearch, faTrash, faBars, faDashboard, faList, faShop, faShoppingBag, faSort, faUserPlus, faPen } from "@fortawesome/free-solid-svg-icons";
import { Dropdown, DropdownButton, Image } from "react-bootstrap";
import Drawer from '@mui/material/Drawer';

export default function ReviewList() {
    const { reviews = [], loading = true, error, isReviewDeleted } = useSelector(state => state.productState)
    const [productId, setProductId] = useState("");
    const dispatch = useDispatch();



    const deleteHandler = (e, id) => {
        e.target.disabled = true;
        dispatch(deleteReview(productId, id))
    }

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(getReviews(productId))
    }

    useEffect(() => {
        if (error) {
            toast(error, {
                type: 'error',
                onOpen: () => { dispatch(clearError()) }
            })
            return
        }
        if (isReviewDeleted) {
            toast('Review Deleted Succesfully!', {
                type: 'success',
                onOpen: () => dispatch(clearReviewDeleted())
            })
            dispatch(getReviews(productId))
            return;
        }


    }, [dispatch, error, isReviewDeleted])



    // Drawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    // Navbar
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1000);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    return (
        <>
            <section className="reviewlist-section">
                <div className="row container-fluid">
                    <div className="col-12 col-md-2">
                        <Sidebar />
                    </div>
                    <div className="col-12 col-lg-10 col-md-12 ">
                        <div className="mobile-logo">
                          <img src={require("../../images/procure-g-logo.png")}/>
                        </div>
                        <div className="breadcrumbWrapperr">



                            {/* Breadcrumbs & Menu Icon Row (For Mobile) */}
                            {isMobile ? (
                                <div className="row mobile-topbar">
                                    <div className="col-10">
                                        <ul className="breadcrumb breadcrumb2 mb-0">
                                            <li>
                                                <Link to="/admin/dashboard" style={{ color: "#fff" }}>Dashboard</Link>
                                            </li>
                                            <li>Review List</li>
                                        </ul>
                                    </div>
                                    <div className="col-2 text-end">
                                        <button className="fab" onClick={toggleDrawer}>
                                            <FontAwesomeIcon icon={faList} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="row dash-navbar-big-glc">
                                    <div className="col-lg-3 col-md-12">
                                        <ul className="breadcrumb breadcrumb2 mb-0">
                                            <li>
                                                <Link to="/admin/dashboard">Dashboard</Link>
                                            </li>
                                            <li>Review List</li>
                                        </ul>
                                    </div>
                                    <div className="col-lg-7 col-md-6" style={{ display: "flex", justifyContent: "end", alignItems: "end" }}>
                                        <div className="dash-cont-glc">
                                            <div className="row">
                                                <div className="topnav">
                                                    <div className="search-container">
                                                        <form className="d-flex">
                                                            <input type="text" placeholder="Search" name="search" />
                                                            <button type="submit">
                                                                <FontAwesomeIcon icon={faSearch} />
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-1 col-md-2 dash-cont-glc" style={{ display: "flex", justifyContent: "center", alignItems: "end" }}>
                                        <Dropdown className="d-inline">
                                            <Dropdown.Toggle
                                                variant="default text-white"
                                                id="dropdown-basic"
                                                className="text-dark dropdown1 icon-list-filter-procureg"
                                                style={{ backgroundImage: 'none', border: 'none', boxShadow: "none" }}
                                            >
                                                <FontAwesomeIcon icon={faFilter} />
                                            </Dropdown.Toggle>
                                        </Dropdown>
                                    </div>
                                    <div className="col-lg-1 col-md-2 dash-cont-glc">
                                        <img src={avatar1} alt="Avatar" className="avatar" />
                                    </div>
                                </div>
                            )}
                            {/* Search, Filter & Avatar Row (For Mobile) */}
                            {isMobile && (
                                <div className="row mobile-bottombar">
                                    <div className="col-8">
                                        <div className="search-container">
                                            <form className="d-flex">
                                                <input type="text" placeholder="Search" name="search" />
                                                <button type="submit">
                                                    <FontAwesomeIcon icon={faSearch} />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="col-2 text-center">
                                        <Dropdown className="d-inline">
                                            <Dropdown.Toggle
                                                variant="default text-white"
                                                id="dropdown-basic"
                                                className="text-dark dropdown1 icon-list-filter-procureg"
                                                style={{ backgroundImage: 'none', border: 'none', boxShadow: "none" }}
                                            >
                                                <FontAwesomeIcon icon={faFilter} />
                                            </Dropdown.Toggle>
                                        </Dropdown>
                                    </div>
                                    <div className="col-2 text-center">
                                        <img src={avatar1} alt="Avatar" className="avatar" />
                                    </div>
                                </div>
                            )}

                            {/* Drawer Component */}
                            <Drawer open={isDrawerOpen} onClose={toggleDrawer} direction="right" className="drawer">
                                <div className="drawer-header">
                                    ADMIN DASHBOARD
                                    {/* <button className="drawer-close-btn" onClick={toggleDrawer}>&times;</button> */}
                                </div>
                                <div className="drawer-content">
                                    <ul className="drawer-links">
                                        <li><Link to="/admin/dashboard"><FontAwesomeIcon icon={faDashboard} /> &nbsp;Dashboard</Link></li>
                                        <li><Link to="/admin/products"><FontAwesomeIcon icon={faCartShopping} /> &nbsp;Product List</Link></li>
                                        <li><Link to="/admin/products/create"><FontAwesomeIcon icon={faShoppingBag} /> &nbsp;Create Product</Link></li>
                                        <li><Link to="/admin/orders"><FontAwesomeIcon icon={faSort} /> &nbsp;Order List</Link></li>
                                        <li><Link to="/admin/users"><FontAwesomeIcon icon={faUserPlus} /> &nbsp;User List</Link></li>
                                        <li><Link to="/admin/reviews"><FontAwesomeIcon icon={faPencil} /> &nbsp;Review List</Link></li>
                                    </ul>
                                </div>
                            </Drawer>

                        </div>

                        <h3 className="" style={{ color: "#ffad63", marginTop: "40px" }}>REVIEW LIST</h3>
                        <p>Glocre</p>


                        <section className=" mt-2">

                            <div className="cartWrapper pr-3 mt-4">
                                <div className="table-responsive" style={{ overflowX: "auto" }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th style={{ minWidth: "200px" }}>NAME</th>
                                                <th style={{ minWidth: "200px" }}>RATING</th>
                                                <th style={{ minWidth: "200px" }}>COMMENTS</th>
                                                <th style={{ minWidth: "200px" }}>REVIEW TYPE</th>
                                                <th style={{ minWidth: "200px" }}>DATE</th>
                                                <th style={{ minWidth: "200px" }}>ACTIONS</th>
                                            </tr>
                                        </thead>

                                        <tbody >
                                            {loading ? (
                                                <Loader />
                                            ) : (
                                                reviews.map((review) => (
                                                    <tr>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <span style={{ color: "#000000b3", fontSize: "15px" }}>
                                                                    {review.user.name}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span >
                                                                {review.rating}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span>
                                                                {review.comment}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className={review.rating < 3 ? "text-danger" : "text-success"}>
                                                                {review.rating < 3 ? "Bad" : "Good"}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className="cursor">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <Button style={{ backgroundColor: "#2f4d2a", outline: "none", border: "none" }} onClick={e => deleteHandler(e, review._id)} className="btn ms-2">
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <br />

                        </section>


                    </div>
                </div>
            </section>
        </>
    )
}