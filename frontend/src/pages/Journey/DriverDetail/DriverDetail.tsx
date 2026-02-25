import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  deleteDriverEntryAsync,
  driverSelectors,
  fetchDriverEntriesAsync,
  selectDriverLoading,
  updateDriverEntryAsync,
} from "../../../features/driver";
import { useEffect, useState } from "react";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import Loading from "../../../components/Loading";
import type { DriverType } from "../../../types/driver";
import EditHeader from "../../../components/EditHeader";
import DetailBlock from "../JourneyDetail/components/DetailBlock";
import FormInputImage from "../../../components/FormInputImage";
import { addMessage } from "../../../features/message";
import {
  fetchSettlementsAsync,
  settlementSelectors,
} from "../../../features/settlement";
import HeaderWithChild from "../../../components/HeaderWithChild";
import { formatDate } from "../../../utils/formatDate";
import Overlay from "../../../components/Overlay";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CreditCard,
  Image as ImageIcon,
  Calculator,
  Download,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Briefcase
} from "lucide-react";

const DriverDetail = () => {
  const { id } = useParams();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const drivers = useSelector(driverSelectors.selectAll);
  const settlements = useSelector(settlementSelectors.selectAll);
  const loading = useSelector(selectDriverLoading);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localDriver, setLocalDriver] = useState<DriverType | null>(null);
  const [backupDriver, setBackupDriver] = useState<DriverType | null>(null);
  const [changedDocuments, setChangedDocuments] = useState<Set<string>>(
    new Set()
  );
  const emptyFieldValue = "---------";
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  useEffect(() => {
    dispatch(fetchDriverEntriesAsync());
    dispatch(fetchSettlementsAsync());
  }, [dispatch]);

  const driver = drivers.find((driver) => driver._id === id);

  useEffect(() => {
    if (driver && !loading) setLocalDriver(driver);
  }, [driver, loading, id]);

  if (loading || !localDriver) return <Loading />;

  const driverSettlements = settlements.filter(
    (settlement) => settlement.driver._id === localDriver._id
  );

  const isDirty = JSON.stringify(localDriver) !== JSON.stringify(driver);

  const handleFileSelect = (file: File | null, field: keyof DriverType) => {
    setLocalDriver((prev) => (prev ? { ...prev, [field]: file } : prev));
  };

  const handleDelete = async (id: string) => {
    try {
      const resultAction = await dispatch(deleteDriverEntryAsync(id));
      if (deleteDriverEntryAsync.fulfilled.match(resultAction)) {
        dispatch(addMessage({ type: "success", text: "Driver deleted" }));
        navigate("/journey/all-driver-entries");
      } else if (deleteDriverEntryAsync.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error) {
          dispatch(
            addMessage({ type: "error", text: "Failed to delete driver" })
          );
        }
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.entries(localDriver).forEach(([key, value]) => {
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

      if (changedDocuments.size > 0) {
        formData.append(
          "changedDocuments",
          JSON.stringify([...changedDocuments])
        );
      }

      const resultAction = await dispatch(
        updateDriverEntryAsync({ id: localDriver._id, updateDriver: formData })
      );
      if (updateDriverEntryAsync.fulfilled.match(resultAction)) {
        dispatch(
          addMessage({ type: "success", text: "Driver updated successfully" })
        );
      } else if (updateDriverEntryAsync.rejected.match(resultAction)) {
        const errors = resultAction.payload;
        if (errors) {
          dispatch(
            addMessage({ type: "error", text: "Failed to update driver" })
          );
        }
      }
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: "Something went wrong" }));
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Drivers
        </button>
        <EditHeader
          heading="Driver Portfolio"
          isDirty={isDirty}
          onEditClick={() => {
            setIsEditMode(true);
            setBackupDriver(localDriver);
          }}
          onCancelClick={() => {
            setLocalDriver(backupDriver);
            setIsEditMode(false);
          }}
          onDeleteClick={() => {
            handleDelete(localDriver._id);
            setIsEditMode(false);
          }}
          onDiscardClick={() => {
            setLocalDriver(backupDriver);
            setIsEditMode(false);
          }}
          onSaveClick={() => {
            handleSave();
            setIsEditMode(false);
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="card-premium p-8 flex flex-col items-center text-center gap-6 bg-slate-900 border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl group-hover:border-indigo-500/30 transition-all duration-500">
                <img
                  src={typeof localDriver.driver_img === 'string' ? localDriver.driver_img : ''}
                  alt={localDriver.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 text-white rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <h2 className="text-3xl font-black italic tracking-tight text-white">{localDriver.name}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <Briefcase size={12} className="text-indigo-400" />
                Senior Logistics Associate
              </div>
            </div>

            <div className="w-full pt-6 border-t border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID Verified</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Yes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">On-Duty</span>
              </div>
            </div>
          </div>

          <DetailBlock
            title="Legal Credentials"
            icon={<CreditCard size={18} />}
            isEditMode={isEditMode}
            onChange={(key, value) => {
              setLocalDriver((prev) => {
                if (!prev) return prev;
                if (key.includes("dl")) {
                  return {
                    ...prev,
                    [key]: value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 15)
                      .replace(
                        /^([A-Z]{2})([0-9]{2})([0-9]{4})([0-9]{0,7}).*$/,
                        "$1 $2 $3 $4"
                      )
                      .trim(),
                  };
                }
                return {
                  ...prev,
                  [key]: value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 12)
                    .replace(/(\d{4})(?=\d)/g, "$1 "),
                };
              });
            }}
            fields={[
              {
                key: "adhaar_no",
                label: "Adhaar Identification",
                value: localDriver.adhaar_no,
                isEditable: true,
              },
              {
                key: "dl",
                label: "Driving Privilege (DL)",
                value: localDriver.dl,
                isEditable: true,
              },
            ]}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <DetailBlock
              title="Profile Specifications"
              icon={<User size={18} />}
              isEditMode={isEditMode}
              onChange={(key, value) => {
                setLocalDriver((prev) => {
                  if (!prev) return prev;
                  if (key.includes("phone")) {
                    return {
                      ...prev,
                      [key]: value.replace(/[^0-9]/g, "").slice(0, 10),
                    };
                  }
                  return {
                    ...prev,
                    [key]: value,
                  };
                });
              }}
              fields={[
                {
                  key: "name",
                  label: "Legal Full Name",
                  value: localDriver.name,
                  isEditable: true,
                },
                {
                  key: "phone",
                  label: "Contact Mobile",
                  value: localDriver.phone,
                  isEditable: true,
                },
                {
                  key: "home_phone",
                  label: "Family/Home Contact",
                  value: localDriver.home_phone,
                  isEditable: true,
                },
                {
                  key: "address",
                  label: "Residential Address",
                  value: localDriver.address,
                  isEditable: true,
                },
              ]}
            />
          </div>

          <DetailBlock
            title="Digital Documentation"
            icon={<ImageIcon size={18} />}
            fields={[]}
            childs={
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <FormInputImage
                  label="Profile Photo"
                  id="driver_img"
                  name="driver_img"
                  isEditMode={isEditMode}
                  value={typeof localDriver.driver_img === "string" ? localDriver.driver_img : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "driver_img");
                    setChangedDocuments((prev) => new Set([...prev, "driver_img"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="Adhaar (Front)"
                  id="adhaar_front_img"
                  name="adhaar_front_img"
                  isEditMode={isEditMode}
                  value={typeof localDriver.adhaar_front_img === "string" ? localDriver.adhaar_front_img : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "adhaar_front_img");
                    setChangedDocuments((prev) => new Set([...prev, "adhaar_front_img"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="Adhaar (Back)"
                  id="adhaar_back_img"
                  name="adhaar_back_img"
                  isEditMode={isEditMode}
                  value={typeof localDriver.adhaar_back_img === "string" ? localDriver.adhaar_back_img : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "adhaar_back_img");
                    setChangedDocuments((prev) => new Set([...prev, "adhaar_back_img"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="DL Scan (Front)"
                  id="dl_front_img"
                  name="dl_front_img"
                  isEditMode={isEditMode}
                  value={typeof localDriver.dl_front_img === "string" ? localDriver.dl_front_img : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "dl_front_img");
                    setChangedDocuments((prev) => new Set([...prev, "dl_front_img"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
                <FormInputImage
                  label="DL Scan (Back)"
                  id="dl_back_img"
                  name="dl_back_img"
                  isEditMode={isEditMode}
                  value={typeof localDriver.dl_back_img === "string" ? localDriver.dl_back_img : ""}
                  onFileSelect={(file) => {
                    handleFileSelect(file, "dl_back_img");
                    setChangedDocuments((prev) => new Set([...prev, "dl_back_img"]));
                  }}
                  onFileClick={(preview) => setPreviewImg(preview)}
                />
              </div>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
              <Calculator className="text-indigo-600 w-8 h-8" />
              Salary <span className="text-indigo-600">Settlements</span>
            </h2>
            <p className="text-slate-500 font-medium text-sm">Review historical salary computations and periodic earnings.</p>
          </div>

          <button
            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-100 hover:bg-slate-800 hover:-translate-y-1 transition-all active:translate-y-0"
            onClick={() => navigate(`/journey/driver-detail/${localDriver._id}/settlement`)}
          >
            <Calculator size={18} />
            Run New Settlement
          </button>
        </div>

        <div className="card-premium overflow-hidden border-slate-100 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">S. No.</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Period From</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Period To</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Trips</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Distance (Km)</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Total Earnings</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {driverSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <p className="text-slate-400 font-bold italic">No settlements found for this driver.</p>
                    </td>
                  </tr>
                ) : (
                  driverSettlements.map((settlement, index) => (
                    <tr
                      key={settlement._id}
                      onClick={() => navigate(`settlement/${settlement._id}`)}
                      className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-400">#{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-700">{safeDate(settlement.period.from)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-700">{safeDate(settlement.period.to)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span className="inline-flex px-3 py-1 bg-white border border-slate-100 rounded-lg text-xs font-black text-slate-600 shadow-sm">{settlement.journeys.length}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-slate-700 text-right">{settlement.total_distance.toLocaleString()} km</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-indigo-600 text-right italic">₹{settlement.overall_total.toLocaleString()}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`
                                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                                        ${settlement.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}
                                    `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${settlement.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {settlement.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {previewImg && (
        <Overlay onCancel={() => setPreviewImg("")}>
          <div className="relative group max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-2xl">
            <img
              src={previewImg}
              alt="Preview Image"
              className="w-full h-full object-contain rounded-3xl"
            />
            <button
              className="absolute top-8 right-8 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
              onClick={() => {
                const link = document.createElement("a");
                link.href = previewImg;
                link.download = "document-download.jpg";
                link.click();
              }}
            >
              <Download size={18} />
              Download Full Resolution
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default DriverDetail;
