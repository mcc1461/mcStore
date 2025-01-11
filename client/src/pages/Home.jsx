import Logo from "../components/Logo";
import { BsArrowRight } from "react-icons/bs";
import logbook from "../assets/logbook.png";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="flex items-center justify-center w-screen h-screen text-white bg-red-500">
      <div className="h-[90vh] w-[90vw] flex items-center justify-center">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-white ">
            <div>
              {" "}
              <Logo />{" "}
            </div>
            <div className="flex items-center justify-between w-[25vh] text-xl font-semibold">
              <Link
                to="/register"
                className="w-16 text-center text-white no-underline transition ease-in-out delay-150 rounded-xl hover:-translate-1 hover:scale-110"
              >
                <p className="hover:text-slate-200"> Register</p>
              </Link>
              <Link
                to="/login"
                className="w-16 text-center text-white no-underline transition ease-in-out delay-150 rounded-xl hover:-translate-1 hover:scale-110"
              >
                <p className="hover:text-slate-200">Login</p>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between h-[80vh]">
            <div className="w-[48%] h-[90%] flex flex-col justify-between">
              <p className="text-6xl font-semibold">
                Elevating Your Sales Management Solutions.
              </p>
              <p>
                MusCo Store is .... is your all in one sales management
                solution, designed to streamline your sales processes and boost
                your business’s Success. With MusCo Store, you can:
              </p>
              <p className="flex gap-3">
                <BsArrowRight className="text-3xl" />
                Easily register product availability
              </p>
              <p className="flex gap-3">
                <BsArrowRight className="text-3xl" />
                Track sales and customer interactions
              </p>
              <p className="flex gap-3">
                <BsArrowRight className="text-3xl" />
                Monitor stock levels and product quantities
              </p>
              <p className="flex gap-3">
                <BsArrowRight className="text-3xl" />
                Gain real-time insights into your sales performance
              </p>
            </div>
            <div className="w-[48%] h-[90%]">
              <img src={logbook} alt="" className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
