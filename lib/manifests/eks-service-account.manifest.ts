export default {
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    name: 'eks-admin',
    namespace: 'kube-system'
  }
}
