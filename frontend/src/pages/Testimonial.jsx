import { Link } from 'react-router-dom';
import '../styles/orders.css';

const REVIEWS = [
  {
    name: 'Maria L.',
    location: 'Loon, Bohol',
    quote: 'The strawberry frozen dessert is my go-to after work. Pickup at the Loon branch is always quick and the staff are friendly.',
    rating: 5,
  },
  {
    name: 'Jason R.',
    location: 'Calape, Bohol',
    quote: 'Cash on delivery worked perfectly in Calape. The cart checkout made it easy to choose my branch and flavors.',
    rating: 5,
  },
  {
    name: 'Anne P.',
    location: 'Tubigon, Bohol',
    quote: 'Love tracking my order with the TRK code. The mochi ice cream arrived cold and creamy — will order again!',
    rating: 5,
  },
];

export default function Testimonial() {
  return (
    <main className="orders-page page-shell" style={{ margin: '0 6%' }}>
      <section className="orders-hero" style={{ margin: '24px 0 0' }}>
        <div className="orders-hero-copy">
          <p className="section-kicker">Customer stories</p>
          <h1>Testimonials</h1>
          <p>
            Hear from shoppers across Loon, Calape, and Tubigon who cool down with Jojo&apos;s scoops, smooth
            checkout, and reliable pickup or delivery.
          </p>
          <div className="orders-hero-actions" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <Link className="btn-shop" to="/products">Shop flavors</Link>
            <Link className="btn-shop orders-secondary-btn" to="/orders">My Orders</Link>
          </div>
        </div>
        <div className="orders-hero-summary">
          <div className="orders-metric">
            <span>Average rating</span>
            <strong>4.9 / 5</strong>
          </div>
          <div className="orders-metric">
            <span>Happy customers</span>
            <strong>100k+</strong>
          </div>
          <div className="orders-metric">
            <span>Branches</span>
            <strong>3</strong>
          </div>
        </div>
      </section>

      <section className="orders-card" style={{ margin: '20px 0 40px' }}>
        <div className="orders-list">
          {REVIEWS.map((review) => (
            <article key={review.name} className="order-card" style={{ cursor: 'default' }}>
              <div className="order-card-preview">
                <div className="order-card-header">
                  <div>
                    <p className="section-kicker">{review.location}</p>
                    <h3 className="order-title">{review.name}</h3>
                    <p className="order-subtitle">
                      {'★'.repeat(review.rating)}
                      <span style={{ color: '#666', marginLeft: 8 }}>Verified customer</span>
                    </p>
                  </div>
                </div>
                <p style={{ color: '#444', lineHeight: 1.65, fontSize: '1.02rem' }}>&ldquo;{review.quote}&rdquo;</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
