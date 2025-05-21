const CompanyCard = ({ company }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 dark:bg-gray-800">
        <h3 className="text-xl font-bold mb-2">{company.name}</h3>
        <p className="text-gray-600 dark:text-gray-300">{company.description}</p>
        <p className="text-sm text-gray-500 mt-1">Region: {company.region?.name}</p>
        <p className="text-sm text-gray-500">Services: {company.services?.map(s => s.name).join(", ")}</p>
      </div>
    );
  };
  
  export default CompanyCard;
  