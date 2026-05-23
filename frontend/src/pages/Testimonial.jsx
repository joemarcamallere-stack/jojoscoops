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
    <main className="orders-page page-shell" style={{ margin: '0 6%', textAlign: 'center' }}>
      <section className="orders-hero" style={{ margin: '24px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="orders-hero-copy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <p className="section-kicker">Customer stories</p>
          <h1>Testimonials</h1>
          <p>
            Hear from shoppers across Loon, Calape, and Tubigon who cool down with Jojo&apos;s scoops, smooth
            checkout, and reliable pickup or delivery.
          </p>
          <div className="orders-hero-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <Link className="btn-shop" to="/products">Shop flavors</Link>
            <Link className="btn-shop orders-secondary-btn" to="/orders">My Orders</Link>
          </div>
        </div>
        <div className="orders-hero-summary" style={{ justifyContent: 'center', marginTop: '40px', gap: '40px' }}>
          <div className="orders-metric" style={{ alignItems: 'center' }}>
            <span>Average rating</span>
            <strong>4.9 / 5</strong>
          </div>
          <div className="orders-metric" style={{ alignItems: 'center' }}>
            <span>Happy customers</span>
            <strong>100k+</strong>
          </div>
          <div className="orders-metric" style={{ alignItems: 'center' }}>
            <span>Branches</span>
            <strong>3</strong>
          </div>
        </div>
      </section>

      <section className="orders-card" style={{ margin: '40px auto', maxWidth: '900px' }}>
        <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {REVIEWS.map((review) => (
            <article key={review.name} className="order-card" style={{ cursor: 'default', textAlign: 'center' }}>
              <div className="order-card-preview" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="order-card-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p className="section-kicker">{review.location}</p>
                    <h3 className="order-title" style={{ justifyContent: 'center' }}>{review.name}</h3>
                    <p className="order-subtitle" style={{ justifyContent: 'center' }}>
                      {'★'.repeat(review.rating)}
                      <span style={{ color: '#666', marginLeft: 8 }}>Verified customer</span>
                    </p>
                  </div>
                </div>
                <p style={{ color: '#444', lineHeight: 1.65, fontSize: '1.02rem', fontStyle: 'italic', maxWidth: '600px', margin: '0 auto' }}>&ldquo;{review.quote}&rdquo;</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
