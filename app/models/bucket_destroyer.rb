# create bucket on the ceph helper
class BucketDestroyer


  def initialize(access)
    # @ceph  = CephHelper.new(ceph_access)
    @helper = bildr_helper_is_ready.new(access)
    @bucket_name = access[:id]

    ensure_bucket_to_destroy?
  end


  def perform(action=nil)
    raise Nilavu::InvalidParameters unless @helper.present?

    @helper.destroy_bucket(@bucket_name)
  end

  private

  def ensure_bucket_to_destroy?
    raise Nilavu::InvalidParameters unless @bucket_name
  end

  def bildr_helper_is_ready
      bildr = BackupRestore::StorageProvider.new
      return unless bildr.implementation
      bildr.implementation
  end

end
