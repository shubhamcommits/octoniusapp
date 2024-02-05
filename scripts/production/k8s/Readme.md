# Project Documentation for Octonius k8s
![Diagram](diagrams/hetzner_cloud_infra.png)

## Introduction

This guide outlines the configuration and operational details of the Kubernetes environment set up for Octonius Inc on Hetzner Cloud. Leveraging k3s for a lightweight Kubernetes distribution, this project facilitates a scalable, secure, and efficient platform for various applications and services.

## Project Structure

The project is structured into separate environments for production and acceptance, ensuring a robust deployment pipeline. Configuration files, Terraform scripts, and application manifests are organized as follows:

- `scripts/production/k8s`: Contains resources for the production environment, including Kubernetes manifests and Terraform scripts.
- `scripts/acceptance/k8s`: Similar structure for the acceptance environment, facilitating testing and validation before production deployment.

Each environment includes:

- **Applications** like MongoDB, MinIO, and the Octonius suite.
- **Monitoring tools** such as Prometheus, Grafana, and Loki for observability.
- **Backup solutions** for data resilience.

## Getting Started

### Prerequisites

- Hetzner Cloud account with appropriate permissions.
- CLI tools installed: `kubectl`, `terraform`, `packer`.
- Understanding of Kubernetes and Terraform basics.
> **_reference_** 
> https://github.com/kube-hetzner/terraform-hcloud-kube-hetzner
> https://kubernetes.io/docs/reference/kubectl/quick-reference/
> https://justinoconnorcodes.files.wordpress.com/2021/09/terraform-cheatsheet-1.pdf

### Setup Instructions

#### Infrastructure Provisioning

1. Navigate to the environment-specific directory (`production` or `acceptance`).
2. Use Terraform to set up the Hetzner Cloud infrastructure:

    ```bash
    terraform validate
    terraform apply -auto-approve
    ```

![Diagram](diagrams/kubernetes_cluster.png)
####  Cluster Configuration

- **Apply** the **k3s_kubeconfig.yaml** within the same directory to access your Kubernetes cluster.

#### Application Deployment

- **Follow** the README in each application directory within the environment folder for deployment instructions.

###  Maintenance and Monitoring

####  Updating Applications

- **Keel.sh** is utilized to automate application updates within the Kubernetes cluster. Consult the **02_keel.sh** README for setup and usage instructions.

####  Monitoring Setup

Implement monitoring and logging with Prometheus, Grafana, and Loki, following the provided configuration guides within the **05_monitoring** directory.


### Backups

Set up regular backups as outlined in the environment-specific backup documentation, ensuring data resilience and recovery capabilities.

### Additional Details

#### git-crypt Encryption

The **kube-hetzner** folder is encrypted with git-crypt to secure sensitive information. Ensure you have the correct keys to access or modify the configurations.
```bash
#osx
brew install git-crypt
#windows 
pacman -S git-crypt
#linux 
apt-get install git-crypt
```
- After install run the command to unloack

```bash 
git-crypt unloack /path/to/key
```

### Adding Your Cluster to Lens

Lens provides a convenient way to manage your Kubernetes clusters. To get started, you'll need to add your Hetzner Cloud Cluster to Lens. Follow these steps:

1. **Launch Lens**: Open the Lens application on your local machine.

2. **Dashboard Overview**: You'll be greeted with the Lens dashboard. If you're using Lens for the first time, it may appear empty.

3. **Add Cluster**: Click on the "Add Cluster" button, typically located at the top-left corner of the Lens dashboard.

4. **Select Cluster Type**: Choose "Kubernetes" as the cluster type. Lens supports various Kubernetes distributions.

5. **Cluster Configuration**:
   - Enter a name for your cluster. This can be any descriptive name to help you identify the cluster within Lens.
   - In the "Kubeconfig File" field, specify the path to your `k3s_kubeconfig.yaml` file for the Hetzner Cloud Cluster. This file contains the necessary configuration information to access your cluster.

6. **Advanced Options** (Optional): Lens provides advanced options like proxy settings. Configure these options if your cluster setup requires them.

7. **Connect**: Once you've provided the necessary information, click the "Connect" button.

8. **Cluster Added**: Lens will establish a connection to your Hetzner Cloud Cluster. Once successfully connected, you'll see your cluster listed in the Lens dashboard.

Now, your Hetzner Cloud Cluster is added to Lens, and you can start managing it using Lens' intuitive interface.

### Disconnecting from a Cluster

If you ever need to disconnect Lens from your cluster, follow these steps:

1. **Open Lens**: Launch the Lens application.

2. **Dashboard**: In the Lens dashboard, locate the cluster you want to disconnect from.

3. **Cluster Options**: Click on the cluster to select it. This will display additional options.

4. **Disconnect**: Among the options, you'll find a "Disconnect" option. Click on it to disconnect Lens from the cluster.

Adding your Hetzner Cloud Cluster to Lens provides an efficient way to manage and monitor your Kubernetes resources. 

For more detailed information about configuring, deploying, and maintaining applications on your cluster, you can explore the subsequent folders in your project's directory structure. Each folder contains specific resources, configurations, and documentation related to different aspects of your cluster and applications. .
