import Modals from "../components/Modals";
import { useState } from "react";
import { useUpdateCategoryMutation } from "../slices/categoriesApiSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetCategoryDetailsQuery } from "../slices/categoriesApiSlice";
import { toast } from "react-toastify";


export default function CategoryEditScreen() {
  const navigate = useNavigate();
  const categoryId = useSelector((state) => state.category.categoryId);
  const currentPage = 1;

  //api call
  const {
    data: { data: category } = {},
    isError,
    error,
    refetch,
  } = useGetCategoryDetailsQuery({ categoryId, currentPage });
  //console.log(category);

  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description,
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "image" ? files[0] : value,
    }));
  };
  console.log(formData);

  // form validation and modals
  const [validated, setValidated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);
    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }
  };


  const handleModelAction = async () => {
    const loadingToastId = toast.info("Submitting...");

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("description", formData.description);
      formDataObj.append("image", formData.image);

      const result = await updateCategory({ categoryId, formDataObj }).unwrap();
      toast.dismiss(loadingToastId);
      toast.success("Category updated successfully");
      console.log(result);
      refetch();
      navigate(`/home/category/${formData.name}`);

    } catch (err) {
      if (err.data) {
        console.error("Error updating category:", err.data);
        toast.dismiss(loadingToastId);
        toast.error(err.data.msg);
      } else {
        console.error("Error updating category:", err);
      }
    }
    // Close the modal after handling the action
    setShowModal(false);
  };

  const handleCancel = () => {
    navigate(`/home/category/${formData.name}`);
  }

  return (
    <div className="col-sm-12 col-xl-6 w-100">
      <h5 className="mb-0 text-black">Category Edit</h5>
      <p className="mb-3">Update the category</p>
      <div className="bg-white rounded p-4">
        <form
          id="update-category-form"
          noValidate
          className={`needs-validation ${validated ? "was-validated" : ""}`}
          onSubmit={handleSubmit}
        >
          <div className="mb-3 col-md-3">
            <label htmlFor="exampleInputText" className="form-label text-black">
              Category Name
            </label>
            <input
              type="text"
              className="form-control py-1"
              id="exampleInputText"
              aria-describedby="emailHelp"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <div className="invalid-feedback">
              Please enter a category name.
            </div>
          </div>
          <div className="mb-3 col-sm-6 col-md-10">
            <label htmlFor="floatingTextarea" className="form-label text-black">
              Description
            </label>
            <textarea
              className="form-control py-2"
              id="floatingTextarea"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
            ></textarea>
            <div className="invalid-feedback">
              Please provide a description.
            </div>
          </div>
          <div className="mb-3 col-sm-6 col-md-10">
            <label htmlFor="imageInput" className="form-label text-black">
              Category Image
            </label>
            <input
              type="file"
              className="form-control py-2"
              id="image"
              name="image"
              onChange={handleInputChange}
              accept="image/*"

            />
            <div className="invalid-feedback">Please upload an image.</div>
          </div>
          <button
            type="submit"
            className="btn btn-primary py-1"
            disabled={isLoading}
            onClick={() => {
              const form = document.getElementById("update-category-form");
              const formFields = form.querySelectorAll(
                "select, textarea"
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
            {isLoading ? "Updating..." : "Update"}
          </button>{" "}
          <button
            type="button"
            className="btn btn-danger text-white py-1"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </button>
          {/* ConfirmModal component */}
          <Modals
            show={showModal}
            onHide={() => setShowModal(false)}
            onConfirm={handleModelAction}
            title="Confirm Edit"
            body="Are you sure you want to save the changes?"
          />
        </form>
      </div>
    </div>
  );
}


