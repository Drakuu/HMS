
import React, { useState } from 'react';
import InvoiceTable from './InvoiceTable';
import Section from './Section';
import Header from './Header';

const BillingMain = () => {

const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})

  const [items, setItems] = useState([]);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  const handleAddItem = () => {
    if (!description || !quantity || !price) {
      alert('Please fill all fields');
      return;
    }
    setItems([...items, {
      description,
      quantity: parseInt(quantity),
      price: parseFloat(price),
    }]);
    setDescription('');
    setQuantity('');
    setPrice('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <Header/>
      {!showInvoice ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddItem}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Test
            </button>
            <button
              onClick={() => setShowInvoice(true)}
              disabled={items.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Generate Invoice
            </button>
          </div>

          {items.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Test Items</h2>
              <InvoiceTable items={items} />
            </div>
          )}
        </>
      ) : (
        <>
          <header className="mb-6">
            <h2 className="text-2xl font-semibold mt-4">Invoice</h2>
            <div className="flex justify-between mt-2">
              <p><span className="font-semibold">Number:</span> 03245678</p>
              <p><span className="font-semibold">Date:</span> {date}</p>
            </div>
          </header>

          <hr className="border-t-2 border-gray-300 my-4" />

          <Section title="DESCRIPTION">
            <InvoiceTable items={items} />
          </Section>

          <hr className="border-t-2 border-gray-300 my-4" />

          <Section title="PAYMENT TERMS">
            <p className="text-gray-700">
              Payment is due within 30 days from the date of invoice.
            </p>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <Section title="Bill to">
                <div className="bg-gray-100 p-4 rounded">
                  <p className="font-medium">Hospital Name</p>
                  <p>Al Shahbaz Hospital</p>
                  <p>+01 234 567 890</p>
                </div>
              </Section>
            </div>

            <div>
              <Section title="PAYMENT METHOD">
                <p className="text-gray-700">Bank transfer or credit card or Easipaisa/Jazcash accepted.</p>
              </Section>

              <Section title="Bank Account">
                <p className="font-medium">0123 466 789</p>
              </Section>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 my-4" />

          <footer className="mt-6 text-center text-sm text-gray-600">
            <p>www.alshahbaz.com</p>
            <p>+92 3234 567 78</p>
            <p>healthcare@alshabaz.com</p>
          </footer>

          <div className="mt-6 flex justify-between px-4 pb-2 mb-2">
            <button
              onClick={() => setShowInvoice(false)}
              className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-primary-800"
            >
              Back to Entry
            </button>
            <button className="bg-gray-700 text-white px-6 py-2 rounded bg-primary-800">
              Print
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BillingMain;

