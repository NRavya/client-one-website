const prisma = require('../config/prisma');
const crypto = require('crypto');

const handleCashfreeWebhook = async (req, res) => {
    try {
        const rawBody = req.rawBody;
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];

        if (!rawBody || !signature || !timestamp) {
            return res.status(400).send('Missing webhook signature data');
        }

        /*
         * Cashfree signature:
         * Base64(HMAC-SHA256(timestamp + rawBody, secret))
         */
        const signedPayload =
            timestamp + rawBody.toString('utf8');

        const expectedSignature = crypto
            .createHmac(
                'sha256',
                process.env.CASHFREE_SECRET_KEY
            )
            .update(signedPayload)
            .digest('base64');

        const signaturesMatch =
            signature.length === expectedSignature.length &&
            crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );

        if (!signaturesMatch) {
            console.warn(
                'Cashfree webhook signature verification failed'
            );

            return res.status(401).send('Invalid signature');
        }

        const payload = req.body;

        const eventType = payload?.type;

        /*
         * ─────────────────────────────
         * PAYMENT SUCCESS
         * ─────────────────────────────
         */

        if (
            eventType === 'PAYMENT_SUCCESS_WEBHOOK'
        ) {
            const orderId =
                payload?.data?.order?.order_id;

            const payment =
                payload?.data?.payment;

            if (
                !orderId ||
                !payment ||
                payment.payment_status !== 'SUCCESS'
            ) {
                return res.status(200).send('OK');
            }

            const order =
                await prisma.order.findUnique({
                    where: {
                        orderNumber: orderId,
                    },
                });

            if (!order) {
                console.warn(
                    `Cashfree webhook: order not found: ${orderId}`
                );

                return res.status(200).send('OK');
            }

            /*
             * Idempotency:
             * If the order is already successful,
             * don't process it again.
             */
            if (
                order.paymentStatus === 'SUCCESS'
            ) {
                return res.status(200).send('OK');
            }

            await prisma.$transaction(
                async (tx) => {

                    await tx.payment.updateMany({
                        where: {
                            orderId: order.id,
                        },

                        data: {
                            status: 'SUCCESS',
                            providerPaymentId:
                                String(
                                    payment.cf_payment_id
                                ),
                        },
                    });

                    await tx.order.update({
                        where: {
                            id: order.id,
                        },

                        data: {
                            paymentStatus: 'SUCCESS',
                            status: 'PROCESSING',
                        },
                    });
                }
            );

            console.log(
                `Cashfree payment successful: ${orderId}`
            );
        }


        /*
         * ─────────────────────────────
         * PAYMENT FAILED
         * ─────────────────────────────
         */

        else if (
            eventType === 'PAYMENT_FAILED_WEBHOOK'
        ) {
            const orderId =
                payload?.data?.order?.order_id;

            if (!orderId) {
                return res.status(200).send('OK');
            }

            const order =
                await prisma.order.findUnique({
                    where: {
                        orderNumber: orderId,
                    },
                    include: {
                        items: true,
                    },
                });

            if (!order) {
                return res.status(200).send('OK');
            }

            /*
             * Don't overwrite a successful payment
             * with a late failure webhook.
             */
            if (
                order.paymentStatus === 'SUCCESS'
            ) {
                return res.status(200).send('OK');
            }

            await prisma.$transaction(
                async (tx) => {

                    await tx.payment.updateMany({
                        where: {
                            orderId: order.id,
                        },

                        data: {
                            status: 'FAILED',
                        },
                    });

                    await tx.order.update({
                        where: {
                            id: order.id,
                        },

                        data: {
                            paymentStatus: 'FAILED',
                            status: 'FAILED',
                        },
                    });
                }
            );

            console.log(
                `Cashfree payment failed: ${orderId}`
            );
        }

        return res.status(200).send('OK');

    } catch (error) {

        console.error(
            'Cashfree webhook error:',
            error
        );

        return res.status(500).send(
            'Webhook Error'
        );
    }
};

module.exports = {
    handleCashfreeWebhook,
};