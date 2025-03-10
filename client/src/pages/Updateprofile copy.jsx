import { useDispatch, useSelector } from "react-redux";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import { AiFillFileImage } from "react-icons/ai";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

function Updateprofile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [fileName, setFileName] = useState("No Selected file");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    setFirstName(userInfo.firstName);
    setLastName(userInfo.lastName);
    setUserName(userInfo.username);
    setEmail(userInfo.email);
    setPhoneNumber(userInfo.phoneNumber);
    setBio(userInfo.bio);
    setProfileImage(userInfo.photo);
  }, [
    userInfo.firstName,
    userInfo.lastName,
    userInfo.username,
    userInfo.email,
    userInfo.phoneNumber,
    userInfo.bio,
    userInfo.photo,
  ]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      let imageURL = profileImage; // Retain existing image URL if no new image is uploaded

      // Validate file type and upload if a new file is provided
      if (
        fileName &&
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/svg",
          "image/webp",
        ].includes(fileName.type)
      ) {
        const image = new FormData();
        image.append("file", fileName);
        image.append("cloud_name", "ddc5ebbcn");
        image.append("upload_preset", "el7id0ah");

        // Upload image to Cloudinary
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/ddc5ebbcn/image/upload",
          {
            method: "POST",
            body: image,
          }
        );

        if (!response.ok) {
          throw new Error("Image upload failed. Please try again.");
        }

        const imgData = await response.json();
        imageURL = imgData.url; // Extract URL from Cloudinary response
      }

      // Prepare profile update data
      const updatedProfileData = {
        _id: userInfo._id,
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        bio,
        photo: imageURL, // Use new or existing image URL
      };

      // Call profile update function (Redux or API)
      const res = await updateProfile(updatedProfileData).unwrap();

      // Dispatch updated credentials to Redux store
      dispatch(setCredentials(res));

      // Navigate to the profile page and notify user
      navigate("/dashboard/profile");
      toast.success("Profile Updated Successfully");
    } catch (err) {
      console.error("Error updating profile:", err);

      // Display error message from response or fallback to default message
      toast.error(
        err?.data?.message || "Failed to update profile. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-[80vw] h-[85vh] mt-3">
      <form
        onSubmit={submitHandler}
        className="flex items-start justify-center w-[100%] h-full gap-10 "
      >
        <div className="bg-white rounded-lg shadow-lg w-[40%] h-[92%]">
          <div className="w-[98%] flex flex-col items-start justify-between gap-1">
            <h2 className="text-2xl font-bold">Update Profile Details</h2>
            {isLoading && <Loader />}
            <div>
              <label htmlFor="firstName" className="pl-2 font-bold">
                Firstname:
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First Name"
                className="w-full p-2 ml-2 border border-gray-400 rounded-lg"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <label htmlFor="lastName" className="pl-2 font-bold">
                Lastname:
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                className="w-full p-2 ml-2 border border-gray-400 rounded-lg"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <label htmlFor="username" className="pl-2 font-bold">
                Username:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="UserName"
                className="w-full p-2 ml-2 border border-gray-400 rounded-lg"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
              <label htmlFor="email" className="pl-2 font-bold">
                Email:
              </label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="email"
                className="w-full p-2 ml-2 border border-gray-400 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="phoneNumber" className="pl-2 font-bold">
                Phone number:
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="PhoneNumber"
                className="w-full p-2 ml-2 border border-gray-400 rounded-lg"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="">
              <label htmlFor="message" className="pl-2 font-bold">
                Message
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="message"
                className="w-full p-2 ml-2 border border-gray-400 rounded-lg"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="p-1 font-semibold text-center text-white bg-red-500 rounded hover:bg-red-600"
            >
              Save Changes
            </button>
          </div>
        </div>
        <div className="w-[45%] flex flex-col justify-center gap-5">
          <b>
            {" "}
            Profile Image:{" "}
            <span className="text-neutral-500">Jpg, Png, Jpeg, Svg, Webp</span>
          </b>
          <div className="flex flex-col items-center justify-center h-[300px] w-[500px] cursor-pointer rounded-xl bg-white shadow-lg">
            <input
              type="file"
              accept="image/*"
              className="input-field"
              onChange={handleImageUpload}
            />
            {profileImage ? (
              <img src={profileImage} width={150} height={180} alt={fileName} />
            ) : (
              <div>
                <MdCloudUpload color="#1475cf" size={60} />
                <p>Browse Files to upload</p>
              </div>
            )}
          </div>
          <section className="flex items-center justify-between w-full p-[15px] rounded-3xl bg-white shadow-lg">
            <AiFillFileImage color="#1475cf" />
            <span className="flex items-center">
              {fileName} -{" "}
              <MdDelete
                onClick={() => {
                  setFileName("No selected File");
                  setProfileImage(null);
                }}
              />
            </span>
          </section>
        </div>
      </form>
    </div>
  );
}

export default Updateprofile;
