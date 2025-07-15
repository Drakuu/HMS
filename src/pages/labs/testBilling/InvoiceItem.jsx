import React from 'react';

const InvoiceItem = ({ description, quantity, price }) => {
  const total = quantity * price;
  return (
    <tr className="border-b border-gray-200">
      <td className="py-2 px-4 text-left">{description}</td>
      <td className="py-2 px-4 text-right">{quantity}</td>
      <td className="py-2 px-4 text-right">${price.toFixed(2)}</td>
      <td className="py-2 px-4 text-right">${total.toFixed(2)}</td>
    </tr>
  );
};

export default InvoiceItem;
