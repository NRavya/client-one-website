import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { trackPixelEvent } from '../utils/metaPixel';

const MAX_ATTEMPTS = 6;
const RETRY_DELAY = 3000;

const ThankYou = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let retryTimer;

        const verifyAndLoadOrder = async (currentAttempt = 1) => {
            if (!orderId) {
                setError('Order ID is missing.');
                setLoading(false);
                return;
            }

            try {
                setAttempt(currentAttempt);

                /*
                 * IMPORTANT:
                 * Do NOT trust the redirect from Cashfree as proof of payment.
                 *
                 * The backend contacts Cashfree and verifies the actual
                 * payment status for this order.
                 */
                const response = await apiFetch(
                    `/orders/${orderId}/verify-payment`
                );

                if (!response.success) {
                    throw new Error(
                        response.error?.message ||
                        'Unable to verify your payment.'
                    );
                }

                if (cancelled) return;

                /*
                 * The backend should return:
                 *
                 * verified: true  -> payment confirmed
                 * verified: false -> payment still pending
                 */
                const verified = response.data?.verified === true;

                if (verified) {
                    /*
                     * Verification succeeded.
                     *
                     * Use the order returned by the verification endpoint
                     * if available. Otherwise fetch the order normally.
                     */
                    if (response.data?.order) {
                        setOrder(response.data.order);
                    } else {
                        const orderResponse = await apiFetch(
                            `/orders/${orderId}`
                        );

                        if (!orderResponse.success) {
                            throw new Error(
                                orderResponse.error?.message ||
                                'Unable to load your order.'
                            );
                        }

                        setOrder(orderResponse.data);
                    }

                    setLoading(false);
                    return;
                }

                /*
                 * Payment may still be processing.
                 *
                 * Cashfree can take a short moment to update the payment
                 * status, so retry instead of immediately showing an error.
                 */
                if (currentAttempt < MAX_ATTEMPTS) {
                    retryTimer = setTimeout(() => {
                        verifyAndLoadOrder(currentAttempt + 1);
                    }, RETRY_DELAY);

                    return;
                }

                /*
                 * We reached the retry limit.
                 * Load the order one final time so the customer can see
                 * its current status.
                 */
                const finalResponse = await apiFetch(
                    `/orders/${orderId}`
                );

                if (!finalResponse.success) {
                    throw new Error(
                        finalResponse.error?.message ||
                        'Unable to load your order.'
                    );
                }

                if (!cancelled) {
                    setOrder(finalResponse.data);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Payment verification error:', err);

                if (cancelled) return;

                /*
                 * Retry temporary verification failures.
                 * This protects against a short delay between Cashfree
                 * checkout completion and Cashfree's payment API update.
                 */
                if (currentAttempt < MAX_ATTEMPTS) {
                    retryTimer = setTimeout(() => {
                        verifyAndLoadOrder(currentAttempt + 1);
                    }, RETRY_DELAY);

                    return;
                }

                setError(
                    err.message ||
                    'Unable to verify your payment. Please check your account or contact us.'
                );

                setLoading(false);
            }
        };

        verifyAndLoadOrder();

        return () => {
            cancelled = true;

            if (retryTimer) {
                clearTimeout(retryTimer);
            }
        };
    }, [orderId]);

    /* ─────────────────────────────
       Loading / Verification
    ───────────────────────────── */

    if (loading) {
        return (
            <main className="thank-you-page">
                <div className="thank-you-card">
                    <Loader2
                        className="loading-icon"
                        size={42}
                    />

                    <h1>Checking your payment...</h1>

                    <p>
                        Please wait while we confirm your order.
                    </p>

                    {attempt > 1 && (
                        <p className="verification-attempt">
                            Still confirming your payment...
                        </p>
                    )}
                </div>

                <style>{styles}</style>
            </main>
        );
    }

    /* ─────────────────────────────
       Error
    ───────────────────────────── */

    if (error) {
        return (
            <main className="thank-you-page">
                <div className="thank-you-card">

                    <div className="error-icon">
                        !
                    </div>

                    <h1>
                        We couldn't verify your order
                    </h1>

                    <p>
                        {error}
                    </p>

                    <div className="thank-you-actions">

                        <Link
                            to="/"
                            className="primary-btn"
                        >
                            Back to Home
                        </Link>

                        <Link
                            to="/account"
                            className="secondary-btn"
                        >
                            View Account
                        </Link>

                    </div>

                </div>

                <style>{styles}</style>
            </main>
        );
    }

    /* ─────────────────────────────
       Order data
    ───────────────────────────── */

    const orderNumber =
        order?.orderNumber ||
        order?.order_id ||
        orderId;

    const amount =
        order?.totalAmount ??
        order?.amount ??
        order?.order_amount ??
        order?.total ??
        0;

    const items =
        order?.items ||
        order?.orderItems ||
        [];

    const paymentStatus = String(
        order?.payment?.status ||
        order?.paymentStatus ||
        order?.payment_status ||
        'PENDING'
    ).toUpperCase();

    const isSuccessful =
        paymentStatus === 'SUCCESS' ||
        paymentStatus === 'PAID' ||
        paymentStatus === 'COMPLETED';

    // Fire Purchase once per verified-paid order (never on pending/failed).
    // sessionStorage guard also survives refresh / repeated verify responses.
    const purchaseTrackedRef = useRef(null);
    useEffect(() => {
        const orderKey = order?.orderNumber || order?.order_id || orderId;
        if (!loading && !error && isSuccessful && orderKey && purchaseTrackedRef.current !== orderKey) {
            purchaseTrackedRef.current = orderKey;
            let alreadyTracked = false;
            try {
                alreadyTracked = window.sessionStorage.getItem(`meta-purchase:${orderKey}`) === '1';
                if (!alreadyTracked) window.sessionStorage.setItem(`meta-purchase:${orderKey}`, '1');
            } catch {}
            if (alreadyTracked) return;
            const contents = items.map((item) => ({
                id: item.product?.slug || item.product?.id || item.productId || item.id,
                quantity: item.quantity || item.qty || 1,
            }));
            trackPixelEvent('Purchase', {
                value: Number(amount),
                currency: 'INR',
                order_id: orderKey,
                content_ids: contents.map((c) => String(c.id)),
                contents,
                num_items: contents.reduce((s, c) => s + (c.quantity || 1), 0),
            });
        }
    }, [loading, error, isSuccessful, order, orderId, amount]);

    return (
        <main className="thank-you-page">

            <div className="thank-you-card">

                {/* Success icon */}
                <div
                    className={
                        isSuccessful
                            ? 'success-icon'
                            : 'pending-icon'
                    }
                >
                    {isSuccessful ? (
                        <CheckCircle
                            size={64}
                            strokeWidth={1.6}
                        />
                    ) : (
                        <Loader2
                            size={56}
                            strokeWidth={1.6}
                        />
                    )}
                </div>

                {/* Heading */}
                <p className="eyebrow">
                    {isSuccessful
                        ? 'ORDER CONFIRMED'
                        : 'PAYMENT PROCESSING'}
                </p>

                <h1>
                    {isSuccessful
                        ? 'Thank you for your order!'
                        : 'Your order has been received'}
                </h1>

                <p className="thank-you-message">
                    {isSuccessful
                        ? 'Your payment was successful and your order is being prepared.'
                        : 'We have received your order. Payment confirmation is still being processed.'}
                </p>

                {/* Order information */}
                <div className="order-summary">

                    <div className="summary-row">
                        <span>Order Number</span>

                        <strong>
                            {orderNumber}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>Payment Status</span>

                        <strong
                            className={
                                isSuccessful
                                    ? 'status-success'
                                    : 'status-pending'
                            }
                        >
                            {isSuccessful
                                ? 'PAID'
                                : paymentStatus}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>Total Amount</span>

                        <strong>
                            ₹
                            {Number(amount).toLocaleString(
                                'en-IN'
                            )}
                        </strong>
                    </div>

                </div>

                {/* Items */}
                {items.length > 0 && (
                    <div className="items-section">

                        <div className="section-heading">
                            <Package size={19} />

                            <span>
                                Your Items
                            </span>
                        </div>

                        <div className="items-list">

                            {items.map((item, index) => {

                                const productName =
                                    item.product?.name ||
                                    item.productName ||
                                    item.name ||
                                    'Product';

                                const quantity =
                                    item.quantity ||
                                    item.qty ||
                                    1;

                                return (
                                    <div
                                        className="item-row"
                                        key={
                                            item.id ||
                                            index
                                        }
                                    >
                                        <span>
                                            {productName}
                                        </span>

                                        <span>
                                            × {quantity}
                                        </span>
                                    </div>
                                );
                            })}

                        </div>

                    </div>
                )}

                {/* Actions */}
                <div className="thank-you-actions">

                    <Link
                        to="/"
                        className="primary-btn"
                    >
                        Continue Shopping
                    </Link>

                    <Link
                        to="/account"
                        className="secondary-btn"
                    >
                        View My Orders
                    </Link>

                </div>

            </div>

            <style>{styles}</style>
        </main>
    );
};


/* ─────────────────────────────────
   Styles
───────────────────────────────── */

const styles = `

  .thank-you-page {
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 1.5rem;
    background-color: var(--color-bg);
  }

  .thank-you-card {
    width: 100%;
    max-width: 650px;
    text-align: center;
  }

  .success-icon,
  .pending-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
    color: var(--color-wood-dark);
  }

  .pending-icon {
    animation: thankYouSpin 1.5s linear infinite;
  }

  .error-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    background-color: var(--color-border);
    color: var(--color-text);
  }

  .loading-icon {
    animation: thankYouSpin 1s linear infinite;
    color: var(--color-wood-dark);
    margin-bottom: 1.5rem;
  }

  @keyframes thankYouSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .verification-attempt {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: var(--color-gray);
  }

  .eyebrow {
    margin: 0 0 0.75rem;
    font-family: var(--font-heading);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    color: var(--color-gray);
  }

  .thank-you-card h1 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5vw, 3.2rem);
    line-height: 1.1;
    color: var(--color-text);
  }

  .thank-you-message {
    max-width: 500px;
    margin: 1rem auto 2rem;
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-gray);
  }

  .order-summary {
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    margin: 2rem 0;
  }

  .summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
    text-align: left;
  }

  .summary-row:last-child {
    border-bottom: none;
  }

  .summary-row span {
    color: var(--color-gray);
    font-size: 0.9rem;
  }

  .summary-row strong {
    color: var(--color-text);
    font-size: 0.9rem;
    text-align: right;
  }

  .status-success {
    color: var(--color-wood-dark) !important;
  }

  .status-pending {
    color: var(--color-gray) !important;
  }

  .items-section {
    margin: 2rem 0;
    text-align: left;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-family: var(--font-heading);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.8rem;
  }

  .items-list {
    border-top: 1px solid var(--color-border);
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 0;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9rem;
  }

  .item-row span:last-child {
    color: var(--color-gray);
    white-space: nowrap;
  }

  .thank-you-actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  .primary-btn,
  .secondary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-family: var(--font-heading);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition:
      opacity var(--transition-fast),
      background-color var(--transition-fast);
  }

  .primary-btn {
    background-color: var(--color-wood-dark);
    color: var(--color-linen);
  }

  .primary-btn:hover {
    opacity: 0.9;
  }

  .secondary-btn {
    border: 1px solid var(--color-border);
    color: var(--color-text);
    background-color: transparent;
  }

  .secondary-btn:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 600px) {

    .thank-you-page {
      padding: 3rem 1rem;
    }

    .thank-you-card h1 {
      font-size: 2rem;
    }

    .summary-row {
      padding: 0.85rem 0;
    }

    .thank-you-actions {
      flex-direction: column;
    }

    .primary-btn,
    .secondary-btn {
      width: 100%;
    }
  }

`;

export default ThankYou;