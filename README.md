Veraciudad is a Smart City IoT & Blockchain platform designed to monitor and manage water quality and related infrastructure. The system uses sensor data, blockchain technology, and real-time analytics to provide comprehensive water management solutions for smart cities.

## Features

- **Real-time Water Quality Monitoring**: Track key water quality parameters like turbidity, pH, temperature, conductivity, and more
- **Interactive Sensor Map**: View all sensors across the city with interactive mapping
- **Advanced Analytics Dashboard**: Visual representation of all metrics with historical data
- **Blockchain Integration**: Secure and immutable records of water quality data
- **Smart Contract Automation**: Automated responses to water quality issues
- **Garbage Management**: Integrated waste management monitoring
- **Multi-sensor Support**: Support for various sensor types:
  - Water Quality Sensors
  - Flow & Hydraulic Sensors
  - Tank Level Sensors
  - Pump Monitoring Sensors
  - Valve Status Sensors
  - Environmental Sensors
  - Garbage Monitoring Sensors

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **UI/UX**: TailwindCSS
- **Data Visualization**: Chart.js, React-Chartjs-2
- **Maps**: Leaflet, React-Leaflet
- **Blockchain**: Ethereum (using ethers.js)
- **API Communication**: Axios
- **QR Functionality**: React-QR-Scanner

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

### Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
water-quality-monitor/
├── components/           # Reusable UI components
│   ├── garbage/          # Garbage management components
│   ├── AnimatedCitySkyline.tsx
│   ├── GlassCard.js
│   ├── MetricsChart.tsx
│   ├── SensorDetails.tsx
│   ├── SensorMap.tsx
│   └── Timeline.tsx
├── pages/                # Application pages
│   ├── _app.js           # Next.js App component
│   ├── dashboard.tsx     # Main dashboard
│   ├── garbage-management.tsx # Garbage monitoring
│   └── index.js          # Landing page
├── public/               # Static assets
├── styles/               # CSS and styling
├── utils/                # Utility functions
├── next-env.d.ts         # TypeScript declarations
├── package.json          # Project dependencies
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Runs the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint for code quality
- `npm run test` - Runs tests with Jest

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/yourusername/water-quality-monitor](https://github.com/yourusername/water-quality-monitor)
