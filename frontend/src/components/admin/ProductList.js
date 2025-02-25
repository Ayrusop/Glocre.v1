import { Fragment, useEffect, useState } from "react"
import './productlist.css'
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { deleteProduct, getAdminProducts } from "../../actions/productActions"
import { clearError, clearProductDeleted } from "../../slices/singleProductSlice"
import Loader from '../layouts/Loader';
import { toast } from 'react-toastify'
import Sidebar from "./Sidebar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dropdown } from "react-bootstrap";
import Pagination from 'react-js-pagination';
import debounce from 'lodash.debounce'; // Install lodash.debounce if not already
import avatar1 from '../../images/OIP.jpg'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { faCartShopping, faCheck, faMoneyBillTrendUp, faUpload, faUser, faFilter, faPencil, faSearch, faTrash, faBars, faDashboard, faList, faShop, faShoppingBag, faSort, faUserPlus, faPen } from "@fortawesome/free-solid-svg-icons";
import Drawer from '@mui/material/Drawer';

export default function ProductList() {
    const { products = [], loading = true, productsCount, resPerPage, error } = useSelector(state => state.productsState)
    const { isProductDeleted, error: productError } = useSelector(state => state.productState)
    const [clocreProductId, setclocreProductId] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const dispatch = useDispatch();
    const deleteHandler = (e, id) => {
        e.target.disabled = true;
        dispatch(deleteProduct(id))
    }

    const setCurrentPageNo = (pageNo) => {
        setCurrentPage(pageNo);
    };

    const debouncedSearch = debounce((term) => {
        dispatch(getAdminProducts(term, filterStatus));
    }, 300);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!clocreProductId.trim()) return; // Prevent empty searches

        const isObjectId = /^[a-f\d]{24}$/i.test(clocreProductId.trim()); // Check for ObjectId format
        dispatch(getAdminProducts({ keyword: clocreProductId.trim(), idSearch: isObjectId }));
    };
    const handleFilterClick = () => {
        setFilterVisible(!filterVisible);
    };
    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setFilterVisible(false);
        dispatch(getAdminProducts(clocreProductId, status));
    };
    useEffect(() => {
        if (error || productError) {
            toast(error || productError, {
                type: 'error',
                onOpen: () => { dispatch(clearError()) }
            })
            return
        }
        if (isProductDeleted) {
            toast('Product Deleted Succesfully!', {
                type: 'success',
                onOpen: () => dispatch(clearProductDeleted())
            })
            return;
        }
        dispatch(getAdminProducts(clocreProductId, filterStatus, currentPage))
    }, [dispatch, error, isProductDeleted, clocreProductId, filterStatus, currentPage])


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
            <section className="prodlist-section">
                <div className="row container-fluid">
                    <div className="col-lg-2">
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
                                            <li>Product List</li>
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
                                            <li>Product List</li>
                                        </ul>
                                    </div>
                                    <div className="col-lg-7 col-md-6" style={{ display: "flex", justifyContent: "end", alignItems: "end" }}>
                                        <div className="dash-cont-glc">
                                            <div className="row">
                                                <div className="topnav">
                                                    <div className="search-container">
                                                        <form className="d-flex"
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            <input type="text" placeholder="Search" name="search"
                                                                value={clocreProductId}
                                                                onChange={(e) => setclocreProductId(e.target.value)}
                                                            />
                                                            <button type="submit">
                                                                <FontAwesomeIcon icon={faSearch} />
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-1 col-md-2 dash-cont-glc" style={{ display: "flex", justifyContent: "center" }}>
                                        <Dropdown className="d-inline">
                                            <Dropdown.Toggle
                                                variant="default text-white"
                                                id="dropdown-basic"
                                                className="text-dark dropdown1 icon-list-filter-procureg"
                                                style={{ backgroundImage: 'none', border: 'none', boxShadow: "none" }}
                                            >
                                                <FontAwesomeIcon icon={faFilter} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleFilterChange("approved")}>Approved</Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleFilterChange("pending")}>Pending</Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleFilterChange("")}>All</Dropdown.Item>
                                            </Dropdown.Menu>
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
                                            <form className="d-flex"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                }}
                                            >
                                                <input type="text" placeholder="Search" name="search"
                                                    value={clocreProductId}
                                                    onChange={(e) => setclocreProductId(e.target.value)}
                                                />
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
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleFilterChange("approved")}>Approved</Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleFilterChange("pending")}>Pending</Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleFilterChange("")}>All</Dropdown.Item>
                                            </Dropdown.Menu>
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

                        <h3 className="" style={{ color: "#ffad63", marginTop: "40px" }}>PRODUCT LIST</h3>
                        <p>Glocre</p>


                        <div className="">
                            <div className="cartWrapper pr-3 mt-4">
                                <div className="table-responsive" style={{ overflowX: "auto" }}>
                                    <table className="table" >
                                        <thead>
                                            <tr>
                                                <th style={{ minWidth: "200px" }}>NAME</th>
                                                <th style={{ minWidth: "200px" }}>STATUS</th>
                                                <th style={{ minWidth: "200px" }}>STOCK</th>
                                                <th style={{ minWidth: "200px" }}>DATE</th>
                                                <th style={{ minWidth: "200px" }}>Product ID</th>
                                                <th style={{ minWidth: "200px" }}>Update</th>
                                            </tr>
                                        </thead>

                                        <tbody >
                                            {loading ? (
                                                <Loader colSpan="6" />
                                            ) : (
                                                products.map((product) => (
                                                    <>
                                                        <tr  key={product._id}>
                                                            <td >
                                                                <div className="d-flex align-items-center">
                                                                    <span style={{ color: "#8c8c8c" }}>
                                                                        {product.name}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span style={{ color: product.status === 'approved' ? 'green' : '#ffad63' }}>
                                                                    {product.status || 'Pending'}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span style={{ color: "#8c8c8c" }}>
                                                                    {product.stock > 0 ? product.stock : 'Out of Stock'}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className="text-g">
                                                                    {new Date(product.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className="cursor" style={{ color: "#8c8c8c" }}>
                                                                    {product.clocreProductId}
                                                                </span>
                                                            </td>


                                                            <td >
                                                                <Link to={`/admin/products/${product._id}`}>
                                                                    <span className="cursor btn btn-primary" style={{ backgroundColor: "#ffad63", outline: "none", border: "none" }}>
                                                                        <FontAwesomeIcon icon={faPencil} />
                                                                    </span>
                                                                </Link>
                                                            </td>

                                                        </tr>
                                                    </>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                            <br />

                        </div>


                    </div>
                    {productsCount > 0 && productsCount > resPerPage ? (
                        <div className="d-flex justify-content-center mt-5 tab-slider">
                            <Pagination
                                activePage={currentPage}
                                onChange={setCurrentPageNo}
                                totalItemsCount={productsCount}
                                itemsCountPerPage={resPerPage}
                                nextPageText={"Next"}
                                firstPageText={"First"}
                                lastPageText={"Last"}
                                itemClass={"page-item"}
                                linkClass={"page-link"}
                            />
                        </div>
                    ) : null}
                </div>
            </section>
        </>
    )
}