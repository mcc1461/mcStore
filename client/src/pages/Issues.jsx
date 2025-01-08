import { BsTelephone, BsTwitter } from "react-icons/bs";
import { GrMail } from "react-icons/gr";
import { toast } from "react-toastify";
import { useState } from "react";
import Loader from "../components/Loader";

export default function Issues() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const data = {
    subject,
    message,
  };

  const [reportIssues, { isLoading }] = useReportIssuesMutation();

  const sendEmail = async (e) => {
    e.preventDefault();

    try {
      await reportIssues(data);
      toast.success("Message Sent Successfully");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-start justify-center w-[90%] gap-10 mt-5">
        <div className="bg-white rounded-lg shadow-lg w-[50%] h-[70vh] px-3">
          <h2 className="text-2xl font-bold ">Contact Us</h2>
          <form className="" onSubmit={sendEmail}>
            <div className=" ">
              <label htmlFor="subject" className="block font-bold">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Enter subject......."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-400 p-2 rounded-lg"
              />
            </div>
            <div className="">
              <label htmlFor="message" className="block font-bold">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Enter message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-400 p-2 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Send Message
            </button>

            {isLoading && <Loader />}
          </form>
        </div>
        <div className=" flex flex-col items-center justify-center w-[50%] bg-red-500 rounded-lg h-[40vh] text-white text-xl font-bold">
          <p className=" font-extrabold text-2xl w-[100%] text-center">
            Contact Information
          </p>
          <p className="text-lg w-[100%] text-center">
            You can contact us via the contacts listed below:
          </p>
          <div className="w-[80%] flex flex-col items-start justify-center">
            <p className="flex items-center justify-center gap-3 ">
              <BsTelephone /> +2349036788725
            </p>
            <p className="flex items-center justify-center gap-3 ">
              <GrMail className="text-black" /> your.exa.ple@gmail.com
            </p>
            <p className="flex items-center justify-center gap-3">
              <BsTwitter className="text-blue-500" /> @Jodfhgnsngd
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
