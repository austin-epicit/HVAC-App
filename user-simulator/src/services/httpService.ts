import axios from "axios";
import axiosRetry from "axios-retry";

const http = axios.create({ timeout: 60000 });

axiosRetry(http, {
	retries: 3,
	retryDelay: axiosRetry.exponentialDelay,
	retryCondition: (error) =>
		axiosRetry.isNetworkOrIdempotentRequestError(error),
});

export default http;
