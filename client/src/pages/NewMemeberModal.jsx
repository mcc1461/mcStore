// NewMemberModal Component
function NewMemberModal({ isOpen, onClose, onMemberAdded }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    role: "",
    role2: "",
    imageUrl: "",
    uploadImage: null,
    phone: "",
    city: "",
    country: "",
    bio: "",
    roleCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cancelButtonRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("firstName", formData.firstName);
    payload.append("lastName", formData.lastName);
    payload.append("email", formData.email);
    payload.append("username", formData.username);
    payload.append("role", formData.role);
    payload.append("role2", formData.role2);
    payload.append("phone", formData.phone);
    payload.append("city", formData.city);
    payload.append("country", formData.country);
    payload.append("bio", formData.bio);
    payload.append("roleCode", formData.roleCode);
    if (formData.uploadImage) {
      payload.append("image", formData.uploadImage);
    } else {
      payload.append("image", formData.imageUrl);
    }
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/users`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Member added successfully.");
      if (onMemberAdded) onMemberAdded(response.data.user);
      onClose();
    } catch (error) {
      console.error("Error adding member:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while adding the member."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <div className="flex items-center justify-center min-h-screen p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300 transform"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-200 transform"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <div className="relative inline-block w-full max-w-md p-6 overflow-auto text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                Add New Member
              </Dialog.Title>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Other input fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="coordinator">coordinator</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role Code
                  </label>
                  <input
                    type="text"
                    name="roleCode"
                    value={formData.roleCode}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                {/* ... Other fields: firstName, lastName, email, username, role2, phone, city, country, bio, image URL/upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role2 (optional)
                  </label>
                  <input
                    type="text"
                    name="role2"
                    value={formData.role2}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                {/* Image fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    disabled={!!formData.uploadImage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Image (optional)
                  </label>
                  <input
                    type="file"
                    name="uploadImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    type="button"
                    ref={cancelButtonRef}
                    onClick={onClose}
                    className="px-4 py-2 border rounded"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white bg-blue-600 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
