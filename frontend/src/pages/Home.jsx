import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import HeroIceCream from '../components/HeroIceCream';
import { projectImage } from '../lib/checkoutUtils';

export default function Home() {
  const [heroPhotoOk, setHeroPhotoOk] = useState(true);

  return (
    <>
      <main className="hero">
        <div className="hero-content">
          <p className="hero-kicker">🍦 Fresh scoops daily</p>
          <h1>Cool Down With <br /> <span className="accent-text">Our Creamy</span> <br /> Creations</h1>
          <p>The perfect blend of creamy and dreamy. <br /> Taste the magic in every scoop.</p>
          
          <div className="hero-btns">
            <Link className="btn-shop" to="/products">Shop Now</Link>
            <Link to="/products" className="link-process">View Full Gallery</Link>
          </div>

          <div className="stats">
            <div className="stat-item">
              <h2>2000+</h2>
              <p>Types Of Ice Cream</p>
            </div>
            <div className="stat-item">
              <h2>22+</h2>
              <p>Offline Shops</p>
            </div>
            <div className="stat-item">
              <h2>100k+</h2>
              <p>Happy Customers</p>
            </div>
          </div>

          <div className="addon-image">
            <img src={projectImage('images/add_on.png')} alt="Ice cream add on" />
          </div>
        </div>

        <div className="hero-image hero-image--branded">
          {heroPhotoOk ? (
            <img
              className="hero-photo"
              src={projectImage('images/ice_cream.png')}
              alt="Ice cream cone"
              onError={() => setHeroPhotoOk(false)}
            />
          ) : (
            <HeroIceCream />
          )}
          <div className="hero-caption">
            <h3>Satisfy Your <span className="accent-text">Sweet Tooth</span>, Naturally</h3>
            <p>Cool, refreshing, and indulgent treats that are perfect for those warm weather cravings. <Link to="/about">Learn More About Us</Link></p>
          </div>
          <div className="splash-effect"></div>
        </div>
      </main>

      <section className="product-showcase" id="products">
        <div className="showcase-heading">
          <p className="subtitle">Products</p>
          <h2>Scroll through the favorites</h2>
          <p>Browse the featured flavors below, then open the full gallery for the complete collection.</p>
        </div>

        <div className="product-strip" aria-label="Featured ice cream products">
          <article className="showcase-card pink-card">
            <img src={projectImage('images/Beckon.png')} alt="Strawberry Frozen Dessert" />
            <h3>Strawberry Frozen Dessert</h3>
            <Link className="card-link" to="/products">Details</Link>
          </article>

          <article className="showcase-card orange-card">
            <img src={projectImage('images/Frutero.png')} alt="Mango Ice Cream" />
            <h3>Mango Ice Cream</h3>
            <Link className="card-link" to="/products">Details</Link>
          </article>

          <article className="showcase-card green-card">
            <img src={projectImage('images/Bubbies.png')} alt="Mochi Ice Cream" />
            <h3>Mochi Ice Cream</h3>
            <Link className="card-link" to="/products">Details</Link>
          </article>

          <article className="showcase-card blue-card">
            <img src={projectImage('images/Nicks.png')} alt="Chocolate Brownie Ice Cream" />
            <h3>Chocolate Brownie</h3>
            <Link className="card-link" to="/products">Details</Link>
          </article>

          <article className="showcase-card white-card">
            <img src={projectImage('images/Yasso.png')} alt="Coffee Poppables" />
            <h3>Coffee Poppables</h3>
            <Link className="card-link" to="/products">Details</Link>
          </article>
        </div>

        <div className="showcase-actions">
          <Link className="showcase-link" to="/products">Show More</Link>
        </div>
      </section>

      <section className="about-showcase" id="about">
        <div className="about-showcase-content">
          <p className="subtitle">About Us</p>
          <h2>Get the cool down with our creamy creations</h2>
          <p>Ice cream is a staple dessert item enjoyed by people of all ages. We offer a variety of flavors and formats, from traditional scoops to seasonal specials, all designed to make browsing and choosing simple.</p>
          <p>Pickup orders are handled through three limited branches in Loon, Calape, and Tubigon, Bohol, while delivery stays within those same service areas.</p>
          <div className="about-showcase-actions">
             <Link className="showcase-link" to="/about">Learn More About Us</Link>
             <Link className="about-link" to="/products">Back to products</Link>
          </div>
        </div>

        <div className="about-showcase-image">
          <img src={projectImage('images/icream.png')} alt="Ice Cream Bowl" />
        </div>
      </section>
      <Footer />
    </>
  );
}
