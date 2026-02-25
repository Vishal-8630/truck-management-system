import React, { useRef, useState } from "react";
import FormInput from "../../../components/FormInput";
import FormSection from "../../../components/FormSection";
import { EmptyDriverType, type DriverType } from "../../../types/driver";
import FormInputImage from "../../../components/FormInputImage";
import { useDispatch } from "react-redux";
import { addMessage } from "../../../features/message";
import { addDriverEntryAsync } from "../../../features/driver";
import type { AppDispatch } from "../../../app/store";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Home,
  CreditCard,
  FileText,
  Image as ImageIcon
} from "lucide-react";

const NewDriverEntry: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const errorsRef = useRef<Record<string, string>>({});
  const [, forceRender] = useState({});

  const [driver, setDriver] =
    useState<Omit<DriverType, "_id">>(EmptyDriverType);

  const handleTextInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
      forceRender({});
    }
    if (name === "phone" || name === "home_phone") {
      const phone_no = value.replace(/[^0-9]/g, "").slice(0, 10);
      setDriver((prev) => ({ ...prev, [name]: phone_no }));
    } else if (name === "adhaar_no") {
      const adhaar_no = value.replace(/[^0-9]/g, "").slice(0, 12);
      const formatted = adhaar_no.replace(/(\d{4})(?=\d)/g, "$1 ");
      setDriver((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "dl") {
      const dl = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 15)
        .replace(
          /^([A-Z]{2})([0-9]{2})([0-9]{4})([0-9]{0,7}).*$/,
          "$1 $2 $3 $4"
        )
        .trim();

      setDriver((prev) => ({ ...prev, [name]: dl }));
    } else {
      setDriver((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (file: File | null, field: keyof DriverType) => {
    setDriver((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      Object.entries(driver).forEach(([key, value]) => {
        if (!value) return;

        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === "string") {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        }
      });

      const resultAction = await dispatch(addDriverEntryAsync(formData));
      if (addDriverEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Driver added successfully" })
        );
        setDriver(EmptyDriverType);
        navigate("/journey/all-driver-entries");
      } else if (addDriverEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors && !errors?.length && Object.keys(errors)?.length > 0) {
          errorsRef.current = errors;
          forceRender({});
        }
        dispatch(
          addMessage({
            type: "error",
            text: errors?.general || "Failed to add new driver"
          })
        )
      }
    } catch {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <UserPlus className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Register <span className="text-indigo-600">Driver</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Onboard a new driver with personal information and documents.</p>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={handleSubmit}>
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="card-premium p-8 lg:p-10 flex flex-col gap-10">
            <FormSection title="Personal Information" icon={<User size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  type="text"
                  id="name"
                  name="name"
                  label="Full Name"
                  value={driver.name}
                  error={errorsRef.current['name']}
                  placeholder="e.g. Rahul Sharma"
                  onChange={handleTextInputChange}
                  icon={<User size={18} />}
                />
                <FormInput
                  type="text"
                  id="adhaar_no"
                  name="adhaar_no"
                  label="Adhaar Card Number"
                  value={driver.adhaar_no}
                  error={errorsRef.current['adhaar_no']}
                  placeholder="0000 0000 0000"
                  onChange={handleTextInputChange}
                  icon={<CreditCard size={18} />}
                />
                <FormInput
                  type="text"
                  id="phone"
                  name="phone"
                  label="Primary Phone"
                  value={driver.phone}
                  error={errorsRef.current['phone']}
                  placeholder="Mobile number"
                  onChange={handleTextInputChange}
                  icon={<Phone size={18} />}
                />
                <FormInput
                  type="text"
                  id="home_phone"
                  name="home_phone"
                  label="Emergency/Home Phone"
                  value={driver.home_phone || ""}
                  placeholder="Alternative number"
                  onChange={handleTextInputChange}
                  icon={<Home size={18} />}
                />
              </div>
              <div className="mt-6">
                <FormInput
                  type="textarea"
                  id="address"
                  name="address"
                  error={errorsRef.current['address']}
                  label="Permanent Address"
                  value={driver.address || ""}
                  placeholder="Enter full residential address"
                  onChange={handleTextInputChange}
                  icon={<MapPin size={18} />}
                />
              </div>
            </FormSection>

            <FormSection title="Legal Documents" icon={<FileText size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <FormInput
                  type="text"
                  id="dl"
                  name="dl"
                  label="Driving License Number"
                  value={driver.dl}
                  error={errorsRef.current['dl']}
                  placeholder="e.g. DL 0000 00000000"
                  onChange={handleTextInputChange}
                  icon={<CreditCard size={18} />}
                />
              </div>
            </FormSection>
          </div>
        </div>

        {/* Right Column: Profile & Documents */}
        <div className="flex flex-col gap-8">
          <div className="card-premium p-8 flex flex-col gap-8 bg-slate-50/50">
            <FormSection title="Driver Photo" icon={<User size={18} />}>
              <FormInputImage
                label="Upload Face Clear Photo"
                id="driver_img"
                name="driver_img"
                isEditMode
                value={typeof driver.driver_img === "string" ? driver.driver_img : ""}
                onFileSelect={(file) => handleFileSelect(file, "driver_img")}
              />
            </FormSection>

            <div className="flex flex-col gap-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                <ImageIcon size={16} className="text-indigo-600" />
                Verification Docs
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <FormInputImage
                  label="Adhaar Front"
                  id="adhaar_front_img"
                  name="adhaar_front_img"
                  isEditMode
                  value={typeof driver.adhaar_front_img === "string" ? driver.adhaar_front_img : ""}
                  onFileSelect={(file) => handleFileSelect(file, "adhaar_front_img")}
                />
                <FormInputImage
                  label="Adhaar Back"
                  id="adhaar_back_img"
                  name="adhaar_back_img"
                  isEditMode
                  value={typeof driver.adhaar_back_img === "string" ? driver.adhaar_back_img : ""}
                  onFileSelect={(file) => handleFileSelect(file, "adhaar_back_img")}
                />
                <FormInputImage
                  label="DL Front"
                  id="dl_front_img"
                  name="dl_front_img"
                  isEditMode
                  value={typeof driver.dl_front_img === "string" ? driver.dl_front_img : ""}
                  onFileSelect={(file) => handleFileSelect(file, "dl_front_img")}
                />
                <FormInputImage
                  label="DL Back"
                  id="dl_back_img"
                  name="dl_back_img"
                  isEditMode
                  value={typeof driver.dl_back_img === "string" ? driver.dl_back_img : ""}
                  onFileSelect={(file) => handleFileSelect(file, "dl_back_img")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-3"
              >
                <UserPlus size={20} />
                Register Driver
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Double check information before submission</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewDriverEntry;
