import React from 'react';
import InvoiceItem from './InvoiceItem';

const InvoiceTable = ({ items }) => (
  <table className="w-full mt-4">
    <thead>
      <tr className="border-b text-primary-600 border-gray-300">
        <th className="py-2 px-4 text-left">DESCRIPTION</th>
        <th className="py-2 px-4 text-right">QTY</th>
        <th className="py-2 px-4 text-right">PRICE</th>
        <th className="py-2 px-4 text-right">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, index) => (
        <InvoiceItem key={index} {...item} />
      ))}
    </tbody>
  </table>
);

export default InvoiceTable;
