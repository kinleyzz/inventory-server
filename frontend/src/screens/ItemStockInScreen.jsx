import { useEffect, useState } from "react";
import { useCreateStockInMutation } from "../slices/transactionsApiSlice";

import Form from "react-bootstrap/Form";
import { Row, Col, Button, Image } from "react-bootstrap";
import { useGetItemDetailsQuery } from "../slices/itemsApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import testImage from "../assets/laptop.jpg";
import Modals from "../components/Modals";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ItemStockInScreen() {
  const navigate = useNavigate();
  const itemId = useSelector((state) => state.item.itemId);
  //api calls
  const {
    data: { data: item } = {},
    isLoading,
    refetch,
    error,
  } = useGetItemDetailsQuery({ itemId, currentPage: 1, currentPage2: 1 });

  console.log(item);

  const [createStockIn, { isLoading: isStockInLoading, isError }] =
    useCreateStockInMutation();

  // stock in data
  const [itemData, setItemData] = useState({
    item_id: itemId,
    qty: 0,
    total_price: 0,
    created_at: getCurrentDate(),
  });
  console.log(itemData);


  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name == "created_at" && value) {
      setItemData((prevData) => ({
        ...prevData,
        created_at: value,
      }));
    } else {
      setItemData((prevData) => ({
        ...prevData,
        [name]:
          name === "item_id"
            ? parseInt(value, 10) || 0
            : parseInt(value, 10) || 0,
      }));
    }
  };

  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    if (item) {
      const total = item.unit_price * itemData.qty;
      setTotalPrice(total);
      setItemData((prevData) => ({
        ...prevData,
        total_price: total,
      }));
    }
  }, [itemData.qty]);

  const [validated, setValidated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  //submit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    // form validation
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Open the confirmation modal
    setShowModal(true);
  };

  // Confirm action for the modal
  const handleModalAction = async () => {
    // Close the modal
    setShowModal(false);

    const loadingToastId = toast.info("Submitting...");

    try {
      // If the form is valid and confirmed, proceed with the submission
      console.log(itemData);
      const result = await createStockIn(itemData).unwrap();
      refetch();

      // console.log(result);
      // toast.success("item added successfully");
      toast.dismiss(loadingToastId);
      // Show success toast
      toast.success("Item stocked in successfully");
      navigate(`/home/item/${item.name}`);

      setItemData({
        item_id: 0,
        qty: 0,
        total_price: 0,
      });
    } catch (error) {
      // Close loading toast
      toast.dismiss(loadingToastId);
      // Show error toast
      toast.error("Error submitting stock in data");
      console.error("Error creating submitting stock in data:", error);
    }

    // Reset the validated state
    setValidated(false);
  };

  // Close the modal if canceled
  const handleModalCancel = () => {
    setShowModal(false);
  };

  const handleCancel = () => {
    navigate(`/home/item/${item.name}`);
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">
          {error?.code?.message || error.error}
        </Message>
      ) : (
        <div className="col-sm-12 col-xl-6 w-100">
          <h5 className="mb-0 text-black">Stock In </h5>
          <p className="mb-3">Manage stock in </p>
          <div className="bg-white rounded p-4 d-flex">
            <div className="col-sm-5 p-1">
              {item.image ? (
                <Image
                  src={item.image} // Assuming item.image contains the URL
                  alt={`Image for ${item.name}`}
                  fluid
                />
              ) : (
                <Image
                  src={testImage} // Replace testImage with your default image URL
                  alt="Test"
                  fluid
                />
              )}
            </div>

            <div className="col-sm-7 p-2">
              <Form
                id="item-stock-in-form"
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
                className="px-2"
              >
                <Form.Group as={Row} controlId="formGridItemName" size="sm">
                  <Form.Label column sm="4" size="sm">
                    Item :
                  </Form.Label>
                  <Col sm={6}>
                    <Form.Control
                      plaintext
                      readOnly
                      defaultValue={item.name}
                      className="text-black"
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="formGridQuantityAvailable">
                  <Form.Label column sm="4">
                    Qty available:
                  </Form.Label>

                  <Col sm={6}>
                    {" "}
                    <Form.Control
                      plaintext
                      readOnly
                      defaultValue={item.qty_on_hand}
                      className="text-black"
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="formGridChooseCategory">
                  <Form.Label column sm="4">
                    Category :
                  </Form.Label>

                  <Col sm={6}>
                    {" "}
                    <Form.Control
                      plaintext
                      readOnly
                      defaultValue={item.category.name}
                      className="text-black"
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="formGridBrand">
                  <Form.Label column sm="4">
                    Brand :
                  </Form.Label>

                  <Col sm={6}>
                    <Form.Control
                      plaintext
                      readOnly
                      defaultValue={item.brand}
                      className="text-black"
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="formGridUnit">
                  <Form.Label column sm="4">
                    Unit :
                  </Form.Label>

                  <Col sm={6}>
                    <Form.Control
                      plaintext
                      readOnly
                      defaultValue={item.unit}
                      className="text-black"
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="formGridUnitPrice">
                  <Form.Label column sm="4">
                    Unit Price :
                  </Form.Label>

                  <Col sm={6}>
                    <Form.Control
                      plaintext
                      readOnly
                      defaultValue={item.unit_price}
                      className="text-black"
                    />
                  </Col>
                </Form.Group>
                <Row className="py-3">
                  <Col xs={4}>
                    <Form.Group controlId="formGridUnit">
                      <Form.Label>
                        <i>Enter Quantity :</i>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        className="py-1"
                        name="qty"
                        value={itemData.qty}
                        onChange={(e) => {
                          const enteredValue = parseInt(e.target.value, 10);
                          const newValue = enteredValue >= 0 ? enteredValue : 0;

                          // Update state with the new value
                          handleChange({
                            target: { name: "qty", value: newValue },
                          });
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={4}>
                    <Form.Group controlId="formGridUnitPrice">
                      <Form.Label>Total Price</Form.Label>
                      <Form.Control
                        className="py-1"
                        value={`Nu.${totalPrice}`}
                        // onChange={handleChange}
                        name="total_price"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={4}>
                    {/* //DATE */}
                    <Form.Group controlId="formGridDate">
                      <Form.Label>
                        <i>Select Date</i>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        className="py-1"
                        name="created_at"
                        defaultValue={itemData.created_at}
                        required
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select a date.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  variant="primary"
                  type="submit"
                  className="py-1"
                  disabled={isStockInLoading}
                  onClick={() => {
                    const form = document.getElementById("item-stock-in-form");
                    const formFields = form.querySelectorAll(
                      "input, select, textarea"
                    );

                    // Check if the form is valid and all fields are filled
                    const isValid =
                      form.checkValidity() &&
                      Array.from(formFields).every(
                        (field) => field.value.trim() !== ""
                      );

                    if (isValid) {
                      setShowModal(true);
                    } else {
                      // If not valid, trigger form validation
                      setValidated(true);
                    }
                  }}
                >
                  {isStockInLoading ? "Submitting..." : "Confirm"}
                </Button>{" "}
                <Button
                  variant="danger"
                  type="button"
                  className="text-white py-1"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                {isError && <div className="text-danger mt-2">{isError}</div>}
                {/* Modal */}
                <Modals
                  show={showModal}
                  onHide={handleModalCancel}
                  onConfirm={handleModalAction}
                  title="Confirm Item Stock In"
                  body="Are you sure you want to stock in this item?"
                />
              </Form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
