Hierarchy used to test multiple scenarios for installed packages.

installation-full
│
├─ node_modules
│ ├─ dev-01
│ │ └─ package.json (0.5.0)
│ │ prod-02-02 (2.0.0)
│ │ not-installed (0.0.0)
│ ├─ dev-02
│ │ └─ package.json (0.6.0)
│ ├─ empty-01
│ │ └─ dummy.file (to save folder in git)
│ ├─ prod-01
│ │ └─ package.json (1.0.0)
│ ├─ prod-02
│ │ └─ package.json (2.0.0)
│ │ prod-02-02 (2.2.0)
│ ├─ prod-02-02
│ │ └─ package.json (2.0.0)
│ ├─ prod-03
│ │ ├─ node_modules
│ │ │ ├─ @comp-01
│ │ │ │ └─ core
│ │ │ │ └─ package.json (0.5.6)
│ │ │ │ prod-05-05 (6.7.8)
│ │ │ ├─ prod-02-02
│ │ │ │ └── package.json (0.0.2)
│ │ │ │ prod-04-04 (0.3.2)
│ │ │ │ prod-04 (1.2.3)
│ │ │ └─ prod-04-04
│ │ │ └─ package.json (0.3.2)
│ │ │ prod-05-05
│ │ │ └─ package.json (6.7.8)
│ │ └─ package.json (3.0.0)
│ │ prod-02-02 (0.0.2)
│ │ @comp-01/core (0.5.6)
│ └─ prod-04 (1.2.3)
│
└─ package.json (5.0.0)
prod-01 (1.0.0)
prod-02 (2.0.0)
prod-03 (3.0.0)
empty-01 (0.0.0)
dev-01 (0.5.0)
dev-02 (0.6.0)
