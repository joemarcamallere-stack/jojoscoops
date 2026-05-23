import { Link } from 'react-router-dom';
import { projectImage } from '../lib/checkoutUtils';

export default function About() {
  return (
    <div className="about-page-wrapper">
      {/* If you want to use the specific about header you can, but App.jsx has a global header already. I will insert the main content. */}
      <section className="about-container">
        <div className="content-side">
          <h4 className="sub-headline">About Us</h4>
          <h1 className="main-headline">
            Get The Cool Down With Our <span className="highlight">Creamy Creations</span>
          </h1>
          <div className="description">
            <p>Ice Cream Is A Staple Dessert Item Enjoyed By People Of All Ages. An Ice Cream Service Offers Customers A Variety Of Flavors And Options To Choose From, Including Traditional Scoops, Sundaes, Milkshakes, And More.</p>
            <p>These Services Typically Feature A Wide Range Of Flavors, Ranging From Classic Favorites Like Vanilla And Chocolate To More Unique And Adventurous Flavors Such As Green Tea And Lavender Honey.</p>
          </div>
          <div className="branch-section">
            <h2>Our Limited Branches</h2>
            <p>Pickup orders are available only through our three branches, and delivery is limited to Loon, Calape, and Tubigon, Bohol.</p>
            <div className="branch-grid">
              <article className="branch-card">
                <span className="branch-label">Main Branch</span>
                <h3>Loon, Bohol</h3>
                <p>Barangay Poblacion, Loon, Bohol</p>
              </article>
              <article className="branch-card">
                <span className="branch-label">Pickup Branch</span>
                <h3>Calape, Bohol</h3>
                <p>Barangay Poblacion, Calape, Bohol</p>
              </article>
              <article className="branch-card">
                <span className="branch-label">Pickup Branch</span>
                <h3>Tubigon, Bohol</h3>
                <p>Barangay Poblacion, Tubigon, Bohol</p>
              </article>
            </div>
          </div>
          <Link to="/products" className="btn">Shop Our Products</Link>
        </div>

        <div className="image-side">
          <div className="image-wrapper">
            <img src={projectImage('images/icream.png')} alt="Ice Cream Bowl" />

            <div className="decoration butterfly" aria-hidden="true">🦋</div>
            <div className="decoration flower" aria-hidden="true">🌸</div>
          </div>
        </div>
      </section>
    </div>
  );
}
