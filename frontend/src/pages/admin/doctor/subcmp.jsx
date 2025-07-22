import { faFileImage , faFileContract  } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Sub-components for DoctorForm
export const FormHeader = ({ title, description }) => (
  <div className="bg-primary-600 rounded-t-md text-white px-6 py-8 shadow-md">
    <div className="flex items-center">
      <div className="h-12 w-1 bg-primary-300 mr-4 rounded-full"></div>
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-primary-100 mt-1">{description}</p>
      </div>
    </div>
  </div>
);

export const SectionHeader = ({ title, required = false }) => (
  <div className="flex items-center mb-6">
    <div className="h-10 w-1 bg-primary-600 mr-3 rounded-full"></div>
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    {required && <span className="text-red-500 ml-1">*</span>}
  </div>
);

export const ImageUpload = ({ previewImage, isEditMode, handleFileChange }) => (
  <div className="flex justify-center">
    <label htmlFor="doctor_Image" className="cursor-pointer">
      <div className="w-48 h-48 rounded-lg border-4 border-dashed border-primary-300 flex items-center justify-center hover:border-primary-500 transition-colors">
        {previewImage ? (
          <div className="relative w-full h-full">
            <img
              src={previewImage}
              alt="Doctor Preview"
              className="w-full h-full rounded-lg object-cover"
            />
          </div>
        ) : (
          <div className="text-center text-primary-800">
            <FontAwesomeIcon icon={faFileImage} className="text-5xl mb-2" />
            <p className="text-sm font-medium">Upload Doctor Image</p>
            <span className="text-xs text-gray-500">JPG, JPEG, PNG</span>
          </div>
        )}
      </div>
    </label>
    <input
      type="file"
      id="doctor_Image"
      name="doctor_Image"
      className="hidden"
      onChange={handleFileChange}
      accept="image/*"
      required={!isEditMode}
    />
  </div>
);

export const AgreementUpload = ({ agreementPreview, isEditMode, handleFileChange }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      Agreement File {!isEditMode && <span className="text-red-500">*</span>}
    </label>
    <label htmlFor="doctor_Agreement" className="cursor-pointer">
      <div className="border-2 border-dashed border-primary-300 rounded-md p-4 text-center hover:border-primary-500 transition-colors">
        {agreementPreview ? (
          <div className="text-primary-800">
            <FontAwesomeIcon icon={faFileContract} className="text-3xl mb-2" />
            <p className="text-sm font-medium">
              {isEditMode && !agreementFile ? "Current: " : ""}
              {agreementPreview}
            </p>
            {isEditMode && !agreementFile && (
              <p className="text-xs text-gray-500 mt-1">Click to upload new file</p>
            )}
          </div>
        ) : (
          <div className="text-primary-800">
            <FontAwesomeIcon icon={faFileContract} className="text-3xl mb-2" />
            <p className="text-sm font-medium">Upload Agreement File</p>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
          </div>
        )}
      </div>
    </label>
    <input
      type="file"
      id="doctor_Agreement"
      name="doctor_Agreement"
      onChange={handleFileChange}
      className="hidden"
      accept=".pdf,.doc,.docx"
      required={!isEditMode}
    />
  </div>
);

export const QualificationsList = ({ qualifications, handleRemoveQualification }) => (
  <div className="space-y-2">
    {qualifications?.map((qualification, index) => (
      <div key={index} className="flex border border-primary-500 border-t-primary-200 items-center justify-between bg-gray-50 py-2 px-4 rounded-md">
        <span className="text-gray-800 underline italic font-medium">{qualification}</span>
        <button
          type="button"
          onClick={() => handleRemoveQualification(index)}
          className="bg-red-500 px-2 py-1 text-white rounded-md hover:bg-gray-300 focus:outline-none"
        >
          Remove
        </button>
      </div>
    ))}
  </div>
);