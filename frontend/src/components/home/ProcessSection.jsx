import React from "react";
import ProcessCard from "./ProcessCard";

const processData = [
  {
    id: 1,
    image:
      "https://img.magnific.com/free-photo/red-delivery-car-deliver-express-shipping-fast-delivery-with-arrow-graph-background-3d-rendering_56104-1906.jpg?semt=ais_hybrid&w=740&q=80",
    title: "Pick a Product",
    description:
      "Browse our premium collection and choose the perfect product for your custom print.",
  },
  {
    id: 2,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoiOBynbyF8K5IZGVnJfcylzdtvtUAkokf7ue3uBbnOYJagUuXpsDZntdc&s=10",
    title: "Design Preview",
    description:
      "Upload your artwork, personalize it, and preview your design in real time.",
    active: true,
  },
  {
    id: 3,
    image:
      "https://cdn.rolanddg.eu/-/media/roland-emea/images/blog/2024/consistent-quality-through-sampling/screenmobile.jpg?rev=05f807de23fe48988dd7202f421e6e22",
    title: "Printing",
    description:
      "We print your design using premium materials and high-quality printing technology.",
  },
  {
    id: 4,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY-mJeCxXiMTO0G6rYeA2gR7AOSgFRZCJJ6ALLJrGCYQ&s=10",
    title: "Shipping",
    description:
      "Your order is carefully packed and delivered safely to your doorstep.",
  },
];

export default function Process() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5">

        <div className="flex justify-center">
          <span className="rounded-full bg-sky-100 px-8 py-3 font-semibold text-sky-700">
            Digital Printing Workflow
          </span>
        </div>

        <h2 className="mt-8 text-center text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          How We Work
          <br />
          Simple 4 Step Process
        </h2>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {processData.map((item) => (
            <ProcessCard
              key={item.id}
              image={item.image}
              title={item.title}
              description={item.description}
              number={`0${item.id}`}
              active={item.active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}