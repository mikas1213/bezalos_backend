import { Application } from 'express';
import listEndpoints from 'express-list-endpoints';

interface EndpointInfo {
    path: string;
    methods: string[];
}

export const listApiEndpoints = (app: Application): void => {
    const endpoints: EndpointInfo[] = listEndpoints(app);
    console.log('\n=== API Endpoints ===\n');
    endpoints.forEach(endpoint => {
        console.log(`${endpoint.methods.join(', ')} ${endpoint.path}`);
    });
    console.log('\n');
}
