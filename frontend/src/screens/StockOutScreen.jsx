import { useEffect, useState } from "react";
import { useCreateStockOutMutation } from "../slices/transactionsApiSlice";

import Form from "react-bootstrap/Form";
import { Row, Col, Button } from "react-bootstrap";
import { useGetItemsQuery } from "../slices/itemsApiSlice";
import Modals from "../components/Modals";

const StockOutScreen = () => {
  //api calls
  const {
    data: { data: items } = {},
    isLoading: isItemsLoading,
    isError: isItemsEror,
  } = useGetItemsQuery({});

  const [createStockOut, { isLoading: isStockOutLoading, isError }] =
    useCreateStockOutMutation();

  // stock in data
  const [itemData, setItemData] = useState({
    item_id: 0,
    qty: 0,
    total_price: 0,
    type: "",
    status_details: "",
    created_at: "",
  });
  console.log(itemData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "item_id" || name == "qty") {
      setItemData((prevData) => ({
        ...prevData,
        [name]: parseInt(value, 10) || 0,
      }));
    } else if (name == "created_at" && value) {
      setItemData((prevData) => ({
        ...prevData,
        created_at: value,
      }));
    } else {
      setItemData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const [selectedItem, setSelectedItem] = useState(null);
  useEffect(() => {
    if (items && items.length > 0) {
      const item = items.find((item) => item.id === itemData.item_id);
      setSelectedItem(item);
    }
  }, [itemData.item_id]);

  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    if (selectedItem) {
      const total = selectedItem.unit_price * itemData.qty;
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
    const form = e.currentTarget;
    setValidated(true);
    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }
  };
  const handleModalAction = async () => {
    try {
      const result = await createStockOut(itemData).unwrap();
      console.log(result);
      setItemData({
        item_id: 0,
        qty: 0,
        total_price: 0,
        created_at: "",
        type: "",
        status_details: "",
      });
    } catch (error) {
      console.error("Error creating submitting stock in data:", error);
    }
    setShowModal(false);
  };

  return (
    <div className="col-sm-12 col-xl-6 w-100">
      <h5 className="mb-0 text-black">Stock Out </h5>
      <p className="mb-3">Manage stock out </p>
      <div className="bg-white rounded p-4 ">
        <Form
          id="stock-out-form"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <Row className="mb-2 text-black">
            <Col sm={6} md={5}>
              <Form.Group controlId="formGridItemName">
                <Form.Label>
                  <i>Select Item Name</i>
                </Form.Label>
                <Form.Select
                  required
                  name="item_id"
                  value={itemData.item_id}
                  onChange={handleChange}
                  className="py-1"
                >
                  <option value={0} disabled>
                    Item Name
                  </option>
                  {items &&
                    items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6} md={5}>
              <Form.Group controlId="formGridChooseCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  className="py-1"
                  readOnly
                  required
                  defaultValue={selectedItem ? selectedItem.category.name : ""}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2 text-black ">
            <Col xs={6} md={5}>
              {/* //DATE */}
              <Form.Group controlId="formGridDate">
                <Form.Label>
                  <i>Select Date</i>
                </Form.Label>
                <Form.Control
                  type="date"
                  required
                  className="py-1"
                  name="created_at"
                  //value={selectedItem?new Date(itemData.created_at):""}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Please select a date.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6} md={5}>
              <Form.Group controlId="formGridBrand">
                <Form.Label>Brand</Form.Label>
                {/* <Form.Select className="py-1">
                  <option>Choose...</option>
                  <option>...</option>
                </Form.Select> */}
                <Form.Control
                  className="py-1"
                  readOnly
                  required
                  defaultValue={selectedItem ? selectedItem.brand : ""}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2 text-black">
            <Col xs={6} md={5}>
              <Form.Group controlId="formGridBrand">
                <Form.Label>
                  <i>Select Stock out type:</i>
                </Form.Label>
                <Form.Select
                  className="py-1"
                  name="type"
                  onChange={handleChange}
                  required
                  value={selectedItem ? itemData.type : ""}
                >
                  <option disabled value="">
                    Choose...
                  </option>
                  <option value="Sales">Sales</option>
                  <option value="Issues">Issues</option>
                  <option value="Damaged">Damaged</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a date.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={6} md={5}>
              <Form.Group controlId="formGridUnit">
                <Form.Label>Unit</Form.Label>
                <Form.Control
                  className="py-1"
                  readOnly
                  required
                  defaultValue={selectedItem ? selectedItem.unit : ""}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3 text-black ">
            <Col xs={6} md={5}>
              <Form.Group controlId="formGridUnit">
                <Form.Label>Quantity Available</Form.Label>
                <Form.Control
                  type="number"
                  className="py-1"
                  name="qty"
                  value={selectedItem ? selectedItem.qty_on_hand : 0}
                  readOnly
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={5}>
              <Form.Group controlId="formGridUnit">
                <Form.Label>
                  <i>Enter Quantity:</i>
                </Form.Label>
                <Form.Control
                  required
                  type="number"
                  className="py-1"
                  name="qty"
                  value={itemData.qty}
                  onChange={(e) => {
                    const enteredValue = parseInt(e.target.value, 10);
                    const newQuantity = Math.max(
                      1,
                      Math.min(enteredValue, selectedItem.qty_on_hand)
                    );

                    // Update state with the new quantity
                    handleChange({
                      target: { name: "qty", value: newQuantity },
                    });
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a quantity.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3 text-black">
            <Col xs={6} md={5}>
              <Form.Group controlId="formGridUnitPrice">
                <Form.Label>Total Price</Form.Label>
                <Form.Control
                  className="py-1"
                  readOnly
                  required
                  value={`Nu.${totalPrice}`}
                  // onChange={handleChange}
                  name="total_price"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={5}>
              <Form.Group controlId="formGridUnitPrice">
                <Form.Label>Unit Price</Form.Label>
                <Form.Control
                  className="py-1"
                  readOnly
                  required
                  defaultValue={
                    selectedItem ? `Nu.${selectedItem.unit_price}` : ""
                  }
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3 text-black">
            <Col xs={6} md={5}>
              <Form.Group controlId="formGridUnitPrice">
                <Form.Label>
                  <i>Enter Description:</i>
                </Form.Label>
                <Form.Control
                  required
                  className="py-1"
                  defaultValue={selectedItem ? itemData.status_details : ""}
                  onChange={handleChange}
                  name="status_details"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a description.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="primary"
            type="submit"
            className="py-1"
            disabled={isStockOutLoading}
            onClick={() => {
              const form = document.getElementById("stock-out-form");
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
            {isStockOutLoading ? "Submitting..." : "Confirm"}
          </Button>{" "}
          <Button variant="danger" type="button" className="text-white py-1">
            Cancel
          </Button>
          {/* {isError && <div className="text-danger mt-2">{error.message}</div>} */}
          {/* ConfirmModal component */}
          <Modals
            show={showModal}
            onHide={() => setShowModal(false)}
            onConfirm={handleModalAction}
            title="Confirm Stock Out"
            body="Are you sure you want to stock out this item?"
          />
        </Form>
      </div>
    </div>
  );
};

export default StockOutScreen;
